// SDK de Mercado Pago
import mercadopago from "mercadopago";
import {ACCESS_TOKEN} from "../config/config.js";
import {storePaymentData, updatePaymentData} from "../Services/paymentService.js";
import { v4 as uuidv4 } from 'uuid';


export const crearorden = async (req, res) => {
    // Generar UUID
    const referenciaExterna = uuidv4();
    mercadopago.configure({
        access_token: ACCESS_TOKEN,
    });

    const { items, azureId, name, email } = req.body;

    // Registro de los datos recibidos en el cuerpo de la solicitud
    console.log("Datos recibidos:", { items, azureId });

    if (!items || items.length === 0) {
        return res.status(400).send({ error: 'No se están enviando los items para la creación de la preferencia' });
    }

    else
    {

    let preference = {
        "items": items,
        "external_reference": referenciaExterna,
        "payer": {
            "name": req.body.name,
            "email": req.body.email,
        },
        "back_urls": {
            "success": "http://localhost:3000/feedback",
            "failure": "http://localhost:3000/feedback",
            "pending": "http://localhost:3000/feedback"
        },
        "auto_return": "approved",
        "taxes": [{
            "type": "IVA",
            "value": 0
        }],
        "notification_url": "https://5b17-186-99-4-68.ngrok.io/notificacion",
        "statement_descriptor": "DOCS API"
    };

    // Registro de la preferencia que será enviada a MercadoPago
    console.log("Preferencia de Pago que será enviada:", preference);

    mercadopago.preferences
        .create(preference)
        .then(async function (response) {

            // Registro de la respuesta recibida de MercadoPago
            console.log("Respuesta recibida de MercadoPago:", response.body);

            const initialPaymentData = {
                transaction_id: response.body.id,
                status: 'pending',
                total_amount: items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0),
                date_created: response.body.date_created,
                items: response.body.items,
                init_point: response.body.init_point,
                payer: {
                    azureId,
                    name,
                    email,
                },
                payment_method: null,
                merchant_orders_id: null,
                external_reference: referenciaExterna
            };

            await storePaymentData(initialPaymentData);

            res.json({
                pago_mer: response.body.init_point
            });
        })
        .catch(function (error) {

            // Registro del error si hay un fallo al intentar crear la preferencia
            console.error("Error al intentar crear la preferencia:", error);

            res.status(403).send({
                error: 'Revise los datos para la creación de la orden, datos necesarios {quantity y unit_price}'
            });
        });
}
}

export const feedback = function (req, res){
    const { payment_id, status, merchant_orders_id } = req.query;
    const redirectURL = `https://exvilearn.web.app/?payment_id=${payment_id}&status=${status}&merchant_orders_id=${merchant_orders_id}`;
    res.redirect(redirectURL);
}

export const notificacionorden = async (req, res) => {
    try {
        const datos = req.query;
        console.log("Datos de notificación para actualizar tabla", datos);

        // Verificar el topic y obtener el ID.
        if (datos.topic === "payment") {
            const paymentDetails = await mercadopago.payment.findById(datos.id);

            if (!paymentDetails.body) {
                console.error('Detalles de pago no encontrados:', paymentDetails);
                return res.status(404).send({ error: 'Detalles de pago no encontrados' });
            }

            console.log('paymentDetails:', paymentDetails);

            const updatedPaymentData = {
                transaction_id: paymentDetails.body.external_reference,
                status: paymentDetails.body.status,
                payment_method: paymentDetails.body.payment_type_id,
                payment_id: paymentDetails.body.id,
                merchant_orders_id: paymentDetails.body.order?.id || null
            };

            console.log("Datos para actualizar:", updatedPaymentData);

            // Actualizar en la base de datos.
            await updatePaymentData(updatedPaymentData);
        }

        res.status(200).send({ success: true });

    } catch (error) {
        console.error('Error al procesar notificación:', error);
        res.status(500).send({ error: 'Error al procesar notificación' });
    }
};


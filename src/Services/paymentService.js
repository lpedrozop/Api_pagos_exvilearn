import {getPayerByAzureId, insertItemData, insertPayerData, insertTransactionData, updateDataInDatabase} from "../models/paymentModel.js";

export const storePaymentData = async (paymentInfo) => {
    // 1. Verificar si el pagador ya existe
    let payerId = paymentInfo.payer.azureId;
    const existingPayer = await getPayerByAzureId(payerId);

    // Si el pagador no existe, lo insertamos
    if (existingPayer === null) {
        console.log("El pagador no existe, insertando...");
        const payerData = {
            azureId: payerId,
            name: paymentInfo.payer.name,
            email: paymentInfo.payer.email
        };
        await insertPayerData(payerData);
    }
    else {
        console.log("El pagador ya existe:", existingPayer);
    }

    // 2. Insertar la transacción
    const transactionData = {
        paymentID: paymentInfo.transaction_id,
        status: paymentInfo.status,
        total_amount: paymentInfo.total_amount,
        date_created: paymentInfo.date_created,
        init_point: paymentInfo.init_point,
        payment_method: paymentInfo.payment_method,
        merchant_orders_id: paymentInfo.merchant_orders_id,
        payer_id: payerId,
        external_reference: paymentInfo.external_reference
    };
    const transactionId = await insertTransactionData(transactionData); // Esta función devuelve el ID de la transacción insertada
    console.log("Transaction ID obtenido después de insertar:", transactionId);

    // 3. Iterar sobre los ítems y guardar cada uno
    for (const item of paymentInfo.items) {
        console.log("Insertando ítem:", item);
        const itemData = {
            transaction_id: transactionId,
            title: item.title,
            description: item.description,
            unit_price: item.unit_price,
            quantity: item.quantity
        };
        await insertItemData(itemData);
    }
};

export const updatePaymentData = async (paymentInfo) => {
    const dataToUpdate = {
        transaction_id: paymentInfo.transaction_id,
        status: paymentInfo.status,
        payment_method: paymentInfo.payment_method,
        payment_id: paymentInfo.payment_id,
        merchant_orders_id: paymentInfo.merchant_orders_id
    };

    await updateDataInDatabase(dataToUpdate);
};
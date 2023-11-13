import {conectar} from "../config/configDB.js";

const getPayerByAzureId = async (azureId) => {
    const sql = 'SELECT id FROM payers WHERE id = ?';

    return new Promise((resolve, reject) => {
        conectar.query(sql, [azureId], (err, results) => {
            if (err) {
                reject(err);
                return;
            }

            if (results.length > 0) {
                resolve(results[0]);
            } else {
                resolve(null);
            }
        });
    });
};

const insertPayerData = async (data) => {
    // Primero, intentamos recuperar el pagador basado en azureId
    const payerSql = 'SELECT id FROM payers WHERE id = ?';

    return new Promise((resolve, reject) => {
        conectar.query(payerSql, [data.azureId], (err, results) => {
            if (err) {
                reject(err);
                return;
            }

            // Si el pagador ya existe, simplemente devolvemos su ID
            if (results.length > 0) {
                resolve(data.azureId);
                return;
            }

            // Si no existe, lo insertamos en la base de datos
            const insertSql = 'INSERT INTO payers (id, name, email) VALUES (?, ?, ?)';
            conectar.query(insertSql, [data.azureId, data.name, data.email], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(data.azureId);  // Retorna el azureId del pagador
            });
        });
    });
};

const insertTransactionData = async (data) => {
    const sql = `
        INSERT INTO transactions (paymentID, status, total_amount, date_created, init_point, payment_method, merchant_orders_id, payer_id, external_reference)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    console.log("Datos de la transacción a insertar:", data);

    return new Promise((resolve, reject) => {
        conectar.query(sql, [data.paymentID, data.status, data.total_amount, data.date_created, data.init_point, data.payment_method, data.merchant_orders_id, data.payer_id, data.external_reference], (err, results) => {
            if (err) {
                console.error("Error al insertar la transacción:", err);
                reject(err);
            } else {
                console.log("Resultado de inserción de transacción:", results);
                resolve(data.paymentID); // Retorna el ID de la transacción insertada
            }
        });
    });
};

const insertItemData = async (data) => {
    const sql = `
        INSERT INTO items (transaction_id, title, description, unit_price, quantity)
        VALUES (?, ?, ?, ?, ?)
    `;

    console.log("Datos del ítem a insertar:", data);

    return new Promise((resolve, reject) => {
        conectar.query(sql, [data.transaction_id, data.title, data.description, data.unit_price, data.quantity], (err, results) => {
            if (err) {
                console.error("Error al insertar el ítem:", err);
                reject(err);
            } else {
                console.log("Resultado de inserción del ítem:", results);
                resolve();
            }
        });
    });
};


const updateDataInDatabase = async (data) => {
    const sql = `
        UPDATE transactions
        SET status = ?, payment_method = ?, merchant_orders_id = ?
        WHERE external_reference = ?
    `;

    return new Promise((resolve, reject) => {
        conectar.query(sql, [data.status, data.payment_method, data.merchant_orders_id, data.transaction_id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

// Exportar las funciones para que puedan ser usadas en el servicio
export {
    insertPayerData,
    insertTransactionData,
    insertItemData,
    updateDataInDatabase,
    getPayerByAzureId
};
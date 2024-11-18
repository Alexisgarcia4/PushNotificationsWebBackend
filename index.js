const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const webPush = require('web-push');
const { Subscription } = require('./models');
require('dotenv').config(); // Cargar variables de entorno desde .env

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Claves VAPID (debes generarlas una vez)
const publicVapidKey = process.env.VAPID_PUBLIC_KEY; // Leer la clave pública del .env
const privateVapidKey = process.env.VAPID_PRIVATE_KEY; // Leer la clave privada del .env

webPush.setVapidDetails(
    'mailto:developer@example.com',
    publicVapidKey,
    privateVapidKey
);

// Ruta para guardar suscripciones
app.post('/subscribe', async (req, res) => {
    const {/* userId,*/ subscription } = req.body;

    try {

        // Buscar si el endpoint ya existe
        const existingSubscription = await Subscription.findOne({
            where: { endpoint: subscription.endpoint },
        });

        if (existingSubscription) {
            // Opcional: Actualizar los datos existentes
            await existingSubscription.update({
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            });

            return res.status(200).json({ message: 'Suscripción ya registrada, datos actualizados' });
        }

        await Subscription.create({
           // userId,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
        });
        res.status(201).json({ message: 'Suscripción guardada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al guardar la suscripción' });
    }
});

// Ruta para enviar notificaciones
app.post('/notify', async (req, res) => {
    const { userId, message } = req.body;

    try {
        const subscriptions = await Subscription.findAll(/*{ where: { userId } }*/);

        subscriptions.forEach(({ endpoint, p256dh, auth }) => {
            const payload = JSON.stringify({ title: 'Notificación', body: message });

            webPush.sendNotification(
                {
                    endpoint,
                    keys: { p256dh, auth },
                },
                payload
            );
        });

        res.status(200).json({ message: 'Notificaciones enviadas' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al enviar las notificaciones' });
    }
});

app.post('/isRegistered', async (req, res) => {
    const { endpoint } = req.body;

    try {
        if (!endpoint) {
            return res.status(400).json({ message: 'El endpoint es requerido' });
        }

        // Busca si el endpoint existe
        const existingSubscription = await Subscription.findOne({
            where: { endpoint },
        });

        if (existingSubscription) {
            return res.status(200).json({ registered: true, message: 'Usuario registrado' });
        }

        return res.status(200).json({ registered: false, message: 'Usuario no registrado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al verificar la suscripción' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

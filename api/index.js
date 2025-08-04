// Cargar las variables de entorno desde el archivo .env
require('dotenv').config();

// Importar las librerías necesarias
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

// --- Configuración de CORS para tu dominio de Hostinger ---
const corsOptions = {
  origin: 'https://deeppink-crab-363289.hostingersite.com'
};
app.use(cors(corsOptions));
// -------------------------------------------------------------------

app.use(express.json());

// --- CONSTANTES PARA LOS CORREOS ---
const COMPANY_EMAIL = 'apasep.ventas@gmail.com';         // Correo principal de la empresa
const PERSONAL_COPY_EMAIL = 'vicente.empres4@gmail.com';  // Tu copia personal

// ---> IMPORTANTE: El correo del remitente DEBE usar tu dominio verificado: apasep.cl <---
const SENDER_EMAIL_CONTACT = 'contacto@apasep.cl';
const SENDER_EMAIL_BOOKING = 'agenda@apasep.cl';
const SENDER_NAME = 'Luna Servicios'; // El nombre que verá el destinatario
// -----------------------------------

// Ruta para el formulario de contacto general
app.post('/api/send-contact', async (req, res) => {
  try {
    const { name, email, service, message } = req.body;
    if (!name || !email || !service || !message) {
      return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }

    const { data, error } = await resend.emails.send({
      // --- CORRECCIÓN DEFINITIVA ---
      from: `${SENDER_NAME} <${SENDER_EMAIL_CONTACT}>`,
      to: [COMPANY_EMAIL, PERSONAL_COPY_EMAIL, email],
      // -----------------------------
      
      subject: `Nuevo Mensaje de Contacto de: ${name}`,
      html: `
        <h1>Nueva Consulta desde tu Sitio Web</h1>
        <p>Has recibido un nuevo mensaje a través del formulario de contacto.</p>
        <hr>
        <h3>Detalles del Contacto:</h3>
        <ul>
          <li><strong>Nombre:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Servicio de Interés:</strong> ${service}</li>
        </ul>
        <h3>Mensaje:</h3>
        <p>${message}</p>
        <hr>
        <p><small>Este es un correo automático enviado desde tu sitio web.</small></p>
      `,
    });

    if (error) {
      console.error({ error });
      // Enviamos el error de Resend al frontend para un mejor diagnóstico
      return res.status(500).json({ error: 'Error al enviar el correo.', details: error.message });
    }
    res.status(200).json({ message: 'Correo enviado con éxito!', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Ruta para agendar una reunión
app.post('/api/send-booking', async (req, res) => {
  try {
    const { name, email, selectedDay, selectedTime } = req.body;
    if (!name || !email || !selectedDay || !selectedTime) {
        return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }
    const meetingDate = new Date(selectedDay).toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const { data, error } = await resend.emails.send({
      // --- CORRECCIÓN DEFINITIVA ---
      from: `${SENDER_NAME} <${SENDER_EMAIL_BOOKING}>`,
      to: [COMPANY_EMAIL, PERSONAL_COPY_EMAIL, email],
      // -----------------------------

      subject: `Confirmación de Solicitud de Reunión de: ${name}`,
      html: `
        <h1>Confirmación de Solicitud de Reunión</h1>
        <p>Hola ${name}, hemos recibido tu solicitud de reunión para la siguiente fecha y hora. Un especialista revisará la disponibilidad y se pondrá en contacto contigo a la brevedad.</p>
        <hr>
        <h3>Detalles de tu Solicitud:</h3>
        <ul>
          <li><strong>Fecha Solicitada:</strong> ${meetingDate}</li>
          <li><strong>Hora Solicitada:</strong> ${selectedTime}</li>
        </ul>
        <hr>
        <p><small>Este es un correo automático de confirmación enviado desde tu sitio web.</small></p>
      `,
    });

    if (error) {
      console.error({ error });
      // Enviamos el error de Resend al frontend para un mejor diagnóstico
      return res.status(500).json({ error: 'Error al enviar la notificación de reserva.', details: error.message });
    }
    res.status(200).json({ message: 'Reserva notificada con éxito!', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = app;
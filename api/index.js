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

// --- CONSTANTES GLOBALES PARA LOS CORREOS ---
const COMPANY_EMAIL = 'apasep.ventas@gmail.com';
const PERSONAL_COPY_EMAIL = 'vicente.empres4@gmail.com';
const SENDER_DOMAIN = 'apasep.cl'; // Tu dominio verificado
const COMPANY_LOGO_URL = 'https://i.imgur.com/DLcDJzu.png';
const COMPANY_NAME = 'Luna Servicios';
const BRAND_COLOR = '#3b82f6'; // Un azul similar al de tu web (Tailwind's blue-500)

// =================================================================
// === SECCIÓN DE PLANTILLAS DE CORREO HTML PROFESIONALES ===
// =================================================================

// Plantilla base para todos los correos
const createEmailTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f7;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <!-- Header con Logo -->
          <tr>
            <td align="center" style="padding: 20px; background-color: #ffffff;">
              <img src="${COMPANY_LOGO_URL}" alt="${COMPANY_NAME} Logo" width="150" style="display: block;">
            </td>
          </tr>
          <!-- Contenido Principal -->
          <tr>
            <td style="padding: 30px 40px;">
              <h1 style="font-size: 24px; color: #1a202c; margin: 0 0 20px 0;">${title}</h1>
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 20px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; color: #718096; margin: 0;">© ${new Date().getFullYear()} ${COMPANY_NAME}. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// 1A. Correo para la EMPRESA sobre nueva CONSULTA
const createCompanyContactNotificationHtml = ({ name, email, service, message }) => {
    const title = 'Nueva Consulta Web Recibida';
    const body = `
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Has recibido una nueva consulta a través del formulario de contacto. A continuación, los detalles:</p>
        <div style="background-color: #f7fafc; border-left: 4px solid ${BRAND_COLOR}; padding: 15px 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Nombre:</strong> ${name}</p>
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: ${BRAND_COLOR};">${email}</a></p>
            <p style="margin: 0 0 10px 0;"><strong>Servicio de Interés:</strong> ${service}</p>
            <p style="margin: 0;"><strong>Mensaje:</strong></p>
            <p style="margin: 5px 0 0 0; white-space: pre-wrap; color: #4a5568;">${message}</p>
        </div>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Se recomienda contactar al cliente a la brevedad posible.</p>
    `;
    return createEmailTemplate(title, body);
};

// 1B. Correo para el CLIENTE confirmando su CONSULTA
const createClientContactConfirmationHtml = ({ name, email, service, message }) => {
    const title = 'Hemos Recibido tu Consulta';
    const body = `
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Hola ${name},</p>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Gracias por contactar a ${COMPANY_NAME}. Hemos recibido tu mensaje y un especialista de nuestro equipo se pondrá en contacto contigo en las próximas 24 horas hábiles.</p>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Este es un resumen de la información que nos enviaste:</p>
        <div style="background-color: #f7fafc; border-left: 4px solid ${BRAND_COLOR}; padding: 15px 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0 0 10px 0;"><strong>Servicio de Interés:</strong> ${service}</p>
            <p style="margin: 0;"><strong>Tu Mensaje:</strong></p>
            <p style="margin: 5px 0 0 0; white-space: pre-wrap; color: #4a5568;">${message}</p>
        </div>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">¡Esperamos conversar pronto!</p>
    `;
    return createEmailTemplate(title, body);
};

// 2A. Correo para la EMPRESA sobre nueva REUNIÓN
const createCompanyBookingNotificationHtml = ({ name, email, meetingDate, selectedTime }) => {
    const title = 'Nueva Solicitud de Reunión';
    const body = `
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Se ha solicitado una nueva reunión a través de la web. Por favor, revisar disponibilidad y confirmar con el cliente.</p>
        <div style="background-color: #f7fafc; border-left: 4px solid ${BRAND_COLOR}; padding: 15px 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Nombre:</strong> ${name}</p>
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: ${BRAND_COLOR};">${email}</a></p>
            <p style="margin: 0 0 10px 0;"><strong>Fecha Solicitada:</strong> ${meetingDate}</p>
            <p style="margin: 0;"><strong>Hora Solicitada:</strong> ${selectedTime}</p>
        </div>
    `;
    return createEmailTemplate(title, body);
};

// 2B. Correo para el CLIENTE confirmando su REUNIÓN
const createClientBookingConfirmationHtml = ({ name, meetingDate, selectedTime }) => {
    const title = 'Recibimos tu Solicitud de Reunión';
    const body = `
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Hola ${name},</p>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Hemos recibido correctamente tu solicitud para agendar una reunión. Nuestro equipo verificará la disponibilidad y te enviará una invitación formal a tu calendario a la brevedad.</p>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Detalles de tu solicitud:</p>
        <div style="background-color: #f7fafc; border-left: 4px solid ${BRAND_COLOR}; padding: 15px 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Fecha Solicitada:</strong> ${meetingDate}</p>
            <p style="margin: 0;"><strong>Hora Solicitada:</strong> ${selectedTime}</p>
        </div>
    `;
    return createEmailTemplate(title, body);
};


// =================================================================
// === ENDPOINTS DE LA API (LÓGICA PRINCIPAL) ===
// =================================================================

// Ruta para el formulario de contacto general
app.post('/api/send-contact', async (req, res) => {
    try {
        const formData = req.body;
        if (!formData.name || !formData.email || !formData.service || !formData.message) {
            return res.status(400).json({ error: 'Faltan campos requeridos.' });
        }

        // --- CORRECCIÓN: Realizar dos envíos de correo por separado ---
        await Promise.all([
            // 1. Envío a la empresa
            resend.emails.send({
                from: `${COMPANY_NAME} <contacto@${SENDER_DOMAIN}>`,
                to: [COMPANY_EMAIL, PERSONAL_COPY_EMAIL],
                subject: `Nueva Consulta de Contacto: ${formData.name}`,
                html: createCompanyContactNotificationHtml(formData),
            }),
            // 2. Envío de confirmación al cliente
            resend.emails.send({
                from: `${COMPANY_NAME} <no-responder@${SENDER_DOMAIN}>`,
                to: [formData.email],
                subject: 'Confirmación de tu consulta',
                html: createClientContactConfirmationHtml(formData),
            })
        ]);

        res.status(200).json({ message: 'Correo enviado con éxito!' });
    } catch (error) {
        console.error('Error en /api/send-contact:', error);
        res.status(500).json({ error: 'Error interno del servidor al enviar correos.' });
    }
});

// Ruta para agendar una reunión
app.post('/api/send-booking', async (req, res) => {
    try {
        const bookingData = req.body;
        if (!bookingData.name || !bookingData.email || !bookingData.selectedDay || !bookingData.selectedTime) {
            return res.status(400).json({ error: 'Faltan campos requeridos.' });
        }
        
        const formattedDate = new Date(bookingData.selectedDay).toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        // --- CORRECCIÓN: Realizar dos envíos de correo por separado ---
        await Promise.all([
            // 1. Envío a la empresa
            resend.emails.send({
                from: `${COMPANY_NAME} <agenda@${SENDER_DOMAIN}>`,
                to: [COMPANY_EMAIL, PERSONAL_COPY_EMAIL],
                subject: `Nueva Solicitud de Reunión: ${bookingData.name}`,
                html: createCompanyBookingNotificationHtml({ ...bookingData, meetingDate: formattedDate }),
            }),
            // 2. Envío de confirmación al cliente
            resend.emails.send({
                from: `${COMPANY_NAME} <no-responder@${SENDER_DOMAIN}>`,
                to: [bookingData.email],
                subject: 'Recibimos tu solicitud de reunión',
                html: createClientBookingConfirmationHtml({ ...bookingData, meetingDate: formattedDate }),
            })
        ]);

        res.status(200).json({ message: 'Reserva notificada con éxito!' });
    } catch (error) {
        console.error('Error en /api/send-booking:', error);
        res.status(500).json({ error: 'Error interno del servidor al enviar notificaciones.' });
    }
});

module.exports = app;
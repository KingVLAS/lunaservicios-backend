// lunaservicios-backend/api/send-contact.js

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { name, email, service, message } = req.body;

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Puedes cambiarlo si ya verificaste tu dominio
      to: ['contacto@lunaservicios.cl', email],
      subject: `📩 Nueva consulta - ${name}`,
      html: `
        <h2>Consulta Recibida</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Servicio de interés:</strong> ${service}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
        <hr/>
        <p style="margin-top: 20px;">Gracias por confiar en <strong>LunaServicios.cl</strong></p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: err.message });
  }
}

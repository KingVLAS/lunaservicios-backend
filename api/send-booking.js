// lunaservicios-backend/api/send-booking.js

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  const { name, email, date, time } = req.body;

  try {
    const { data, error } = await resend.emails.send({
      from: 'notificaciones@lunaservicios.cl',
      to: ['contacto@lunaservicios.cl', email],
      subject: `🔔 Nueva reserva - ${name}`,
      html: `
        <h2>Reserva Confirmada</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Fecha:</strong> ${date}</p>
        <p><strong>Hora:</strong> ${time}</p>
        <p style="margin-top: 20px;">Gracias por confiar en LunaServicios.cl</p>
      `,
    });

    if (error) return res.status(500).json({ error });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

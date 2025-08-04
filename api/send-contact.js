// lunaservicios-backend/api/send-contact.js

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // --- 🔐 CORS Headers ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // --- Preflight ---
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- Solo permitir POST ---
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { name, email, service, message } = req.body;

  try {
    const { data, error } = await resend.emails.send({
      from: 'notificaciones@lunaservicios.cl',
      to: ['contacto@lunaservicios.cl', email],
      subject: `📩 Nueva consulta - ${name}`,
      html: `
        <h2>Consulta Recibida</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Servicio:</strong> ${service}</p>
        <p><strong>Mensaje:</strong> ${message}</p>
        <br/>
        <p style="margin-top: 20px;">Gracias por contactar a LunaServicios.cl</p>
      `,
    });

    if (error) return res.status(500).json({ error });

    return res.status(200).json({ success: true, data });
   } catch (err) {
    console.error('Error al enviar correo:', err); // 👈 Agregado para depurar
    return res.status(500).json({ error: err.message });
  }
}


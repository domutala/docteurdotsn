import * as nodemailer from "nodemailer";

export async function sendMail(options: nodemailer.SendMailOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILER_HOST,
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      pass: process.env.MAILER_PASSWORD,
      user: process.env.MAILER_USER,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Docteur.sn" <${process.env.MAILER_USER}>`, // sender address
      ...options,
    });
  } catch (error) {
    console.log(error);
  } finally {
    transporter.close();
  }
}

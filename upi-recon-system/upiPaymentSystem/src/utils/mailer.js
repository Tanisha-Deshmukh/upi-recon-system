import nodemailer from "nodemailer";

export const sendEmail = async (email, subject, message) => {
    try {
        // 1. Create a transporter
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // Use SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // 2. Define the email options
        const mailOptions = {
            from: '"SecurePay Support" <noreply@securepay.com>',
            to: email,
            subject: subject,
            text: message,
            html: `<b>${message}</b>`
        };

        // 3. Send the mail
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Email failed:", error.message);
        return false;
    }
};
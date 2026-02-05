const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // secure: true for 465, false for other ports
    let transporter;

    if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    } else {
        // Use Ethereal for testing if no SMTP provided
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log("No SMTP Configured. Using Ethereal Email.");
        console.log(`Ethereal Creds: ${testAccount.user} / ${testAccount.pass}`);
    }

    const message = {
        from: `${process.env.FROM_NAME || 'Purevit'} <${process.env.FROM_EMAIL || 'noreply@purevit.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    const info = await transporter.sendMail(message);

    if (!process.env.SMTP_HOST) {
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    return info;
};

module.exports = sendEmail;

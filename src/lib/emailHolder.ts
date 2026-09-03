import emailjs from "@emailjs/browser";


type SendEmailParams = {
  toEmail: string;

  templateParams: Record<
    string,
    unknown
  >;
};


const EMAILJS_SERVICE_ID =
  "service_nx7898n";


const EMAILJS_PUBLIC_KEY =
  "2TVDc9D7QgTpm0QCs";


const EMAILJS_TEMPLATES = {
  passwordRecovery:
    "template_cxhuybn",
} as const;


export async function sendEmail({
  toEmail,
  templateParams,
}: SendEmailParams) {
  if (!toEmail) {
    throw new Error(
      "O e-mail do destinatário não foi informado.",
    );
  }


  const result =
    await emailjs.send(
      EMAILJS_SERVICE_ID,

      EMAILJS_TEMPLATES.passwordRecovery,

      {
        to_email:
          toEmail,

        ...templateParams,
      },

      {
        publicKey:
          EMAILJS_PUBLIC_KEY,
      },
    );


  return result;
}


export async function sendPasswordRecoveryEmail({
  toEmail,
  toName,
  resetLink,
}: {
  toEmail: string;

  toName: string;

  resetLink: string;
}) {
  return sendEmail({
    toEmail,

    templateParams: {
      to_name:
        toName,

      reset_link:
        resetLink,
    },
  });
}
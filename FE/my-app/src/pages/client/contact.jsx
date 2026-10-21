import { SF_TEXT } from "@/constants/typography";
import { useContactForm } from "@/hooks/client/useContactForm";
import ContactHeader from "@/components/client/contact/contactHeader";
import ContactForm from "@/components/client/contact/contactForm";
import ContactInfoCards from "@/components/client/contact/contactInfoCards";

export default function Contact() {
  const {
    formData,
    alert,
    setAlert,
    submitting,
    headerHeight,
    handleChange,
    handleSubmit,
  } = useContactForm();

  return (
    <main className="w-full flex-1 bg-white" style={{ fontFamily: SF_TEXT }}>
      <ContactHeader headerHeight={headerHeight} />
      <ContactForm
        formData={formData}
        alert={alert}
        setAlert={setAlert}
        submitting={submitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
      <ContactInfoCards />
    </main>
  );
}
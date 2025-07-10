"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How do I book a photographer?",
    answer:
      "You can book a photographer by browsing through our listings, selecting a photographer that matches your requirements, and then clicking the 'Book Now' button on their profile. You'll be guided through the booking process, including selecting dates, discussing your requirements, and making a payment.",
  },
  {
    question: "What happens if I need to cancel my booking?",
    answer:
      "Our cancellation policy varies depending on the photographer and how close to the booking date you cancel. Generally, cancellations made more than 48 hours before the scheduled session may be eligible for a full or partial refund. Please check the specific cancellation policy on the photographer's profile.",
  },
  {
    question: "How are photographers verified on Pixisphere?",
    answer:
      "All photographers on Pixisphere go through a verification process that includes portfolio review, identity verification, and professional experience check. We also collect and verify reviews from past clients to ensure quality service.",
  },
  {
    question: "How long does it take to receive my photos?",
    answer:
      "Delivery times vary depending on the photographer and the type of shoot. Typically, you can expect to receive your edited photos within 1-3 weeks after your session. Some photographers also offer expedited delivery for an additional fee.",
  },
  {
    question: "Can I request specific styles or shots?",
    answer:
      "We encourage you to discuss your vision and preferences with your photographer before the shoot. You can share reference images, create a shot list, or explain the style you're looking for to ensure your expectations are met.",
  },
]

export function FaqSection() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-left text-gray-900 dark:text-white">{faq.question}</AccordionTrigger>
          <AccordionContent className="text-gray-600 dark:text-gray-300">{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

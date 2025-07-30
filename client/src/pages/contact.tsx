import SEOHead from "@/components/seo-head";
import { ContactForm } from "@/components/contact-form";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mail, 
  MessageSquare, 
  Users, 
  HelpCircle,
  MapPin,
  Phone,
  Clock
} from "lucide-react";

export default function Contact() {
  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      description: "Get in touch via email for general inquiries",
      contact: "hello@mvpgenerator.ai",
      link: "mailto:hello@mvpgenerator.ai"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      contact: "Available 24/7",
      link: "#"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community",
      description: "Join our community of entrepreneurs",
      contact: "Discord & Slack",
      link: "#"
    }
  ];

  const faqs = [
    {
      question: "Is MVP Generator AI really free to use?",
      answer: "Yes! Our MVP generator is completely free to use. You can generate unlimited MVP plans without any cost or signup required."
    },
    {
      question: "How accurate are the AI-generated MVP plans?",
      answer: "Our AI analyzes thousands of successful startups and market data to provide highly accurate recommendations with a 95% accuracy rate based on user feedback."
    },
    {
      question: "Can I export and share my MVP plans?",
      answer: "Absolutely! You can export your MVP plans as text files and share them with team members, investors, or collaborators."
    },
    {
      question: "Do you offer custom enterprise solutions?",
      answer: "Yes, we offer enterprise solutions for larger organizations. Please contact us to discuss your specific requirements."
    }
  ];

  return (
    <>
      <SEOHead 
        title="Contact MVP Generator AI - Get Help with Your Startup Planning"
        description="Get in touch with our team for questions about MVP generation, startup planning, or technical support. We're here to help you succeed."
        keywords="contact MVP Generator AI, startup support, MVP help, business planning assistance"
      />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="section-padding bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container-max">
            <div className="text-center mb-16">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Get in Touch
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Have questions about our AI MVP generator? We'd love to hear from you and help with your startup journey.
              </p>
            </div>
            
            {/* Contact Methods */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {contactMethods.map((method, index) => (
                <Card key={index} className="feature-card text-center cursor-pointer hover:scale-105 transition-transform">
                  <CardContent className="p-8">
                    <div className="feature-icon gradient-primary mx-auto mb-4">
                      {method.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
                    <a 
                      href={method.link}
                      className="text-primary font-medium hover:underline"
                    >
                      {method.contact}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Office Info */}
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex items-center justify-center space-x-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Headquarters</p>
                  <p className="text-sm text-muted-foreground">San Francisco, CA</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Support Hours</p>
                  <p className="text-sm text-muted-foreground">24/7 Online</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="section-padding">
          <div className="container-max">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Send us a Message</h2>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>
              <ContactForm />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding bg-muted/50">
          <div className="container-max">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Find answers to common questions about our MVP generator and services.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="feature-card">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <HelpCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

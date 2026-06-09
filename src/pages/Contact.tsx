import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  CheckCircle,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const FORMSUBMIT_EMAIL = "info@ctsctravel.com";

const Contact = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      content: "083 766 8601",
      subContent: "Available 24 Hours",
    },
    {
      icon: Mail,
      title: "Email",
      content: "info@ctsctravel.com",
      subContent: "We'll respond within 2 hours",
    },
    {
      icon: MapPin,
      title: "Location",
      content: "DF Malan Street, Parow North",
      subContent: "Cape Town, 7500",
    },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/shuttlecapetown/",
      icon: Facebook,
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/ctsctravelcpt?igsh=MW45NjF6ZDJmOGIxeA==",
      icon: Instagram,
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/severo-zwartz-08451921/",
      icon: Linkedin,
    },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      subject: String(formData.get("subject") || ""),
      message: String(formData.get("message") || ""),
      _subject: "New CTSC Travel Contact Inquiry",
      _template: "table",
      _captcha: "false",
    };

    try {
      const response = await fetch(
        `https://formsubmit.co/ajax/${FORMSUBMIT_EMAIL}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("FormSubmit request failed");
      }

      setIsSubmitted(true);
      form.reset();

      toast({
        title: "Thanks for your inquiry!",
        description: "We'll get back to you soon.",
      });
    } catch (error) {
      console.error("Contact form error:", error);

      toast({
        title: "Message not sent",
        description:
          "Something went wrong. Please try again or email us directly.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-accent/10 to-accent/5 pt-20 pb-12"
      >
        <div className="container mx-auto mt-4 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="text-sm font-semibold tracking-wider uppercase text-accent">
              Get in Touch
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mt-4">
              Contact Us
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-lg">
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="flex-grow">
        {/* Contact Info Cards */}
        <section className="section-padding bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group p-8 rounded-2xl bg-card border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                    <info.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {info.title}
                  </h3>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {info.content}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {info.subContent}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Form and Socials */}
            <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-2"
              >
                <div className="p-8 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Send us a Message
                  </h2>

                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-12 text-center"
                    >
                      <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
                      <p className="text-lg font-semibold text-foreground">
                        Thanks for your inquiry!
                      </p>
                      <p className="text-muted-foreground mt-2">
                        We'll get back to you soon.
                      </p>

                      <Button
                        type="button"
                        variant="outline"
                        className="mt-6"
                        onClick={() => setIsSubmitted(false)}
                      >
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Full Name
                          </label>
                          <Input
                            name="name"
                            placeholder="John Doe"
                            required
                            className="bg-background border-border"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Email
                          </label>
                          <Input
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            required
                            className="bg-background border-border"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Phone
                          </label>
                          <Input
                            name="phone"
                            placeholder="+27 (0)21 555 0123"
                            className="bg-background border-border"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Subject
                          </label>
                          <Input
                            name="subject"
                            placeholder="How can we help?"
                            required
                            className="bg-background border-border"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Message
                        </label>
                        <Textarea
                          name="message"
                          placeholder="Tell us more about your inquiry..."
                          required
                          rows={5}
                          className="bg-background border-border"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="p-8 rounded-2xl bg-card border border-border h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-6">
                      Follow Us
                    </h3>
                    <p className="text-sm text-muted-foreground mb-8">
                      Stay connected with us on social media for updates, tips,
                      and special offers.
                    </p>

                    <div className="space-y-3">
                      {socialLinks.map((social) => (
                        <a
                          key={social.name}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:border-accent/30 hover:bg-accent/5 transition-all duration-300 group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                            <social.icon className="w-5 h-5 text-accent" />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {social.name}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-3">
                      Business Hours
                    </h4>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>Open 24 Hours</p>
                      <p>Every Day of the Week</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-background"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Our Location
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Based in the heart of Cape Town, we serve the entire greater
                metropolitan area.
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden border border-border shadow-lg h-96">
              <iframe
                title="Shuttle Cape Town Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3310.8894768928574!2d18.494533!3d-33.921799!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1dcc5b2218dd0863%3A0x2449901bb5cbd3ea!2sShuttle%20Cape%20Town!5e0!3m2!1sen!2sza!4v1711939200000"
              />
            </div>
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="w-full mt-16 mb-16 py-12 px-4 bg-gradient-to-r from-accent/10 via-accent/15 to-accent/10 border-y border-accent/20"
        >
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Ready to Experience the Difference?
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied travelers who trust CTSC Travel for
              their transportation needs.
            </p>
            <Link to="/book" className="hidden sm:inline-block mt-6">
              <Button variant="hero" size="sm">
                Book Now
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
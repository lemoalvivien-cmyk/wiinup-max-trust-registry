import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Shield, Clock, CheckCircle, Star, ArrowRight, Users, Bot, FileCheck } from "lucide-react";
import TitanButton from "@/components/titan/TitanButton";
import TitanCard from "@/components/titan/TitanCard";
import TitanBadge from "@/components/titan/TitanBadge";
import TitanFooter from "@/components/titan/TitanFooter";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Landing = () => {
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?role=entreprise");
        return;
      }
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { plan: "starter" },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch {
      navigate("/auth?role=entreprise");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">W</span>
            </div>
            <span className="text-lg font-bold text-foreground">WIINUP MAX</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth"><TitanButton variant="ghost" size="sm">Connexion</TitanButton></Link>
            <Link to="/auth"><TitanButton size="sm">Démarrer à 99 €/an</TitanButton></Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 initial="hidden" animate="visible" custom={0} variants={fadeUp}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight">
            Publiez un besoin.{" "}
            <span className="text-accent">L'IA trouve vos prospects.</span>{" "}
            Vos facilitateurs vous connectent.{" "}
            <span className="text-accent">99 €/an.</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" custom={1} variants={fadeUp}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Le registre de confiance transactionnelle B2B. Chaque deal est prouvé, tracé et rémunéré. Fini les introductions oubliées.
          </motion.p>
          <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?role=entreprise"><TitanButton size="lg" icon={<Zap className="h-5 w-5" />}>Démarrer à 99 €/an</TitanButton></Link>
            <Link to="/auth?role=facilitateur"><TitanButton variant="ghost" size="lg">Devenir facilitateur — c'est gratuit</TitanButton></Link>
          </motion.div>
        </div>
      </section>

      {/* PROBLÈME */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
            className="text-3xl md:text-4xl font-black">
            Vous envoyez des clients à d'autres.{" "}
            <span className="text-accent">Ils oublient de vous payer.</span>{" "}
            C'est terminé.
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              { icon: <Clock className="h-8 w-8" />, title: "0 traçabilité", desc: "Impossible de prouver vos introductions" },
              { icon: <Shield className="h-8 w-8" />, title: "0 preuve juridique", desc: "Votre parole contre la leur" },
              { icon: <Users className="h-8 w-8" />, title: "0 rémunération", desc: "Des milliers d'euros perdus chaque année" },
            ].map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-xl bg-primary-foreground/10">{item.icon}</div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-primary-foreground/70">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FONCTIONNEMENT */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-foreground mb-12">
            Comment ça marche ?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", icon: <FileCheck className="h-6 w-6" />, title: "Publiez un besoin en 30s", desc: "Décrivez ce que vous cherchez. L'IA structure votre demande automatiquement." },
              { step: "2", icon: <Bot className="h-6 w-6" />, title: "L'IA + facilitateurs trouvent", desc: "Prospection IA autonome + réseau de facilitateurs humains. Double moteur." },
              { step: "3", icon: <Shield className="h-6 w-6" />, title: "Deal prouvé et tracé", desc: "Preuves horodatées, hash SHA-256, audit trail complet. Valeur juridique." },
            ].map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <TitanCard variant="outlined" className="text-center h-full">
                  <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <div className="mb-3 flex justify-center text-accent">{item.icon}</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </TitanCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARATIF */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-foreground mb-12">
            Pourquoi WIINUP MAX ?
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "Traditionnel", items: ["0 traçabilité", "0 preuve", "0 suivi", "Confiance aveugle"], highlight: false },
              { name: "Wimmov", items: ["179 €/mois", "Pas d'IA", "Preuves limitées", "Interface datée"], highlight: false },
              { name: "WIINUP MAX", items: ["99 €/AN", "IA intégrée", "Preuves juridiques", "Pipeline complet"], highlight: true },
            ].map((col, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <TitanCard variant={col.highlight ? "elevated" : "outlined"}
                  className={col.highlight ? "border-2 border-accent relative" : ""}>
                  {col.highlight && (
                    <TitanBadge variant="warning" className="absolute -top-3 left-1/2 -translate-x-1/2">RECOMMANDÉ</TitanBadge>
                  )}
                  <h3 className={`text-lg font-bold text-center mb-4 ${col.highlight ? "text-accent" : "text-foreground"}`}>
                    {col.name}
                  </h3>
                  <ul className="space-y-3">
                    {col.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        {col.highlight ? (
                          <CheckCircle className="h-4 w-4 text-titan-success flex-shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-destructive/20 flex-shrink-0" />
                        )}
                        <span className={col.highlight ? "font-medium text-foreground" : "text-muted-foreground"}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </TitanCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PREUVE SOCIALE */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-foreground mb-12">
            Ils ont déjà adopté WIINUP MAX
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { name: "Sophie Martin", role: "Courtière en assurance", metric: "+340% de leads qualifiés", quote: "En 3 mois, j'ai généré plus de leads qu'en 2 ans de networking classique." },
              { name: "Thomas Durand", role: "Agent immobilier", metric: "12 deals en 6 mois", quote: "Le pipeline est clair, les preuves sont solides. Mes facilitateurs sont enfin rémunérés." },
              { name: "Claire Petit", role: "Consultante IT", metric: "ROI x8 en 1 an", quote: "99 € pour un an ? J'ai signé un contrat à 45 000 € grâce à une intro facilitée." },
            ].map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <TitanCard variant="outlined" className="h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                  <TitanBadge variant="success" className="mb-3">{t.metric}</TitanBadge>
                  <p className="text-sm text-muted-foreground italic">"{t.quote}"</p>
                  <div className="flex gap-0.5 mt-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-titan-warning text-titan-warning" />
                    ))}
                  </div>
                </TitanCard>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: "2 847", label: "Deals générés" },
              { value: "72h", label: "Temps moyen 1ère intro" },
              { value: "x12", label: "ROI moyen" },
            ].map((stat, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <p className="text-3xl md:text-4xl font-black text-accent">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GARANTIE NUCLÉAIRE */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <TitanCard className="titan-gradient-gold text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-black text-primary mb-3">Garantie Nucléaire</h2>
              <p className="text-primary/80 text-lg">
                Si aucun facilitateur ne couvre votre secteur en 90 jours, <strong className="text-primary">remboursement intégral</strong>. Zéro risque.
              </p>
            </TitanCard>
          </motion.div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4 titan-gradient-orange">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-accent-foreground mb-4">
            Moins cher qu'un repas d'affaires.
          </h2>
          <p className="text-xl text-accent-foreground/80 mb-8">
            Plus puissant qu'une équipe commerciale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?role=entreprise">
              <TitanButton variant="secondary" size="lg" icon={<ArrowRight className="h-5 w-5" />}>
                Démarrer à 99 €/an
              </TitanButton>
            </Link>
            <Link to="/auth?role=facilitateur">
              <TitanButton variant="ghost" size="lg" className="border-accent-foreground text-accent-foreground hover:bg-accent-foreground/10">
                Facilitateur — Gratuit à vie
              </TitanButton>
            </Link>
          </div>
        </div>
      </section>

      <TitanFooter />
    </div>
  );
};

export default Landing;

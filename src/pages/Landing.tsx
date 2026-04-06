import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Shield, Clock, CheckCircle, Star, ArrowRight, Users, Bot, FileCheck, TrendingUp, Lock, Server } from "lucide-react";
import TitanButton from "@/components/titan/TitanButton";
import TitanCard from "@/components/titan/TitanCard";
import TitanBadge from "@/components/titan/TitanBadge";
import TitanFooter from "@/components/titan/TitanFooter";
import { supabase } from "@/lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Landing = () => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { priceId: "price_99_annual" },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Erreur lors de la redirection vers le paiement");
    } finally {
      setLoading(false);
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
            <TitanButton size="sm" onClick={handleCheckout} disabled={loading}>
              {loading ? "Chargement..." : "Démarrer à 99 €/an"}
            </TitanButton>
          </div>
        </div>
      </header>

      {/* BLOC 1 - HERO */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight"
          >
            Publiez un besoin.{" "}
            <span className="text-accent">L'IA trouve vos prospects.</span>{" "}
            Vos facilitateurs vous connectent.{" "}
            <span className="text-accent">99 €/an.</span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Le registre de confiance transactionnelle B2B. Chaque deal est prouvé, tracé et rémunéré. Fini les introductions oubliées.
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <TitanButton
              size="lg"
              icon={<Zap className="h-5 w-5" />}
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? "Chargement..." : "Démarrer à 99 €/an"}
            </TitanButton>
            <Link to="/auth?role=facilitateur">
              <TitanButton variant="ghost" size="lg">
                Devenir facilitateur — c'est gratuit
              </TitanButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* BLOC 2 - PROBLÈME */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-3xl md:text-4xl font-black"
          >
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
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="flex flex-col items-center gap-3"
              >
                <div className="p-3 rounded-xl bg-primary-foreground/10">{item.icon}</div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-primary-foreground/70">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOC 3 - FONCTIONNEMENT */}
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
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
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

      {/* BLOC 4 - COMPARATIF TUEUR */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-foreground mb-12">
            Pourquoi WIINUP MAX ?
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: "Traditionnel",
                items: ["0 traçabilité", "0 preuve juridique", "Confiance aveugle", "0 €"],
                highlight: false,
              },
              {
                name: "Wimmov",
                items: ["179 €/mois", "Pas d'IA intégrée", "Preuves limitées", "2 148 €/an"],
                highlight: false,
              },
              {
                name: "WIINUP",
                items: ["99 €/AN tout compris", "IA de prospection 24h/24", "Preuves SHA-256 opposables", "Pipeline + facilitateurs + IA"],
                highlight: true,
              },
            ].map((col, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <TitanCard
                  variant={col.highlight ? "elevated" : "outlined"}
                  className={col.highlight ? "border-2 border-accent relative" : ""}
                >
                  {col.highlight && (
                    <TitanBadge variant="warning" className="absolute -top-3 left-1/2 -translate-x-1/2">
                      RECOMMANDÉ
                    </TitanBadge>
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
                        <span className={col.highlight ? "font-medium text-foreground" : "text-muted-foreground"}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </TitanCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOC 5 - ARGUMENTS PAR PROFIL */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-foreground mb-12">
            WIINUP MAX pour tous les profils
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Entreprise - Le Fainéant */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
            >
              <TitanCard variant="outlined" className="h-full">
                <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold mb-4 mx-auto">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground text-center mb-2">Entreprise — Le Fainéant</h3>
                <ul className="space-y-3">
                  <li className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>L'IA prospecte 24h/24 pendant que vous dormez</span>
                  </li>
                  <li className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>Des facilitateurs gratuits vous amènent des clients prouvés</span>
                  </li>
                  <li className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>Vous ne prospectez plus vous validez</span>
                  </li>
                  <li className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>Remboursement garanti si secteur non couvert</span>
                  </li>
                </ul>
              </TitanCard>
            </motion.div>

            {/* Facilitateur - Le Pingre */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUp}
            >
              <TitanCard variant="outlined" className="h-full">
                <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold mb-4 mx-auto">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground text-center mb-2">Facilitateur — Le Pingre</h3>
                <ul className="space-y-3">
                  <li className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>Monétisez votre carnet d'adresses sans investir 1 centime sans CB</span>
                  </li>
                  <li className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>Cockpit complet pour suivre vos commissions en temps réel</span>
                  </li>
                  <li className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>Paiement garanti par preuves opposables</span>
                  </li>
                  <li className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>QR Code pour recruter votre propre réseau en 30 secondes</span>
                  </li>
                </ul>
              </TitanCard>
            </motion.div>

            {/* Le Paranoïaque */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={2}
              variants={fadeUp}
            >
              <TitanCard variant="outlined" className="h-full">
                <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold mb-4 mx-auto">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground text-center mb-2">Le Paranoïaque</h3>
                <ul className="space-y-3">
                  <li className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>Chaque action horodatée avec hash SHA-256 (preuve juridique)</span>
                  </li>
                  <li className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>Communications proxifiées (personne n'a vos coordonnées)</span>
                  </li>
                  <li className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>7 verrous anti-contournement</span>
                  </li>
                  <li className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>Hébergement souverain EU</span>
                  </li>
                  <li className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>Garantie remboursement 90 jours</span>
                  </li>
                </ul>
              </TitanCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BLOC 6 - DÉMO IA */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-foreground mb-12">
            Votre Cockpit IA en action
          </h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
          >
            <TitanCard className="border-2 border-accent/20 overflow-hidden">
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Bot className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-bold text-foreground">Cockpit IA</h3>
                  <TitanBadge variant="success" className="ml-auto text-xs">EN DIRECT</TitanBadge>
                </div>

                <div className="space-y-4">
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <p className="text-sm font-semibold text-foreground mb-3">
                      5 prospects trouvés cette nuit
                    </p>

                    {[
                      { company: "TechVenture SAS", signal: "Levée de fonds", score: 92 },
                      { company: "Consulting Pro SARL", signal: "Nouvelle branche", score: 85 },
                      { company: "Digital Growth Ltd", signal: "Expansion export", score: 78 },
                    ].map((prospect, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-t border-border/50 first:border-t-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{prospect.company}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <TitanBadge variant="outline" className="text-xs">
                              {prospect.signal}
                            </TitanBadge>
                            <div className="flex-1 max-w-xs bg-border rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-accent h-full"
                                style={{ width: `${prospect.score}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-accent">{prospect.score}%</span>
                          </div>
                        </div>
                        <button className="flex-shrink-0 px-3 py-1 text-xs font-medium text-accent border border-accent rounded-md hover:bg-accent/10 transition">
                          Valider
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <span className="text-xs text-muted-foreground">
                      Prochaine analyse dans 6h
                    </span>
                  </div>
                </div>
              </div>
            </TitanCard>
          </motion.div>
        </div>
      </section>

      {/* BLOC 7 - GARANTIE NUCLÉAIRE */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
          >
            <TitanCard className="titan-gradient-gold text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-black text-primary mb-3">Garantie Nucléaire</h2>
              <p className="text-primary/80 text-lg">
                Si aucun facilitateur ne couvre votre secteur en 90 jours,{" "}
                <strong className="text-primary">remboursement intégral</strong>. Zéro risque.
              </p>
            </TitanCard>
          </motion.div>
        </div>
      </section>

      {/* BLOC 8 - PREUVE SOCIALE */}
      <section className="py-20 px-4 bg-muted/30">
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
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
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
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <p className="text-3xl md:text-4xl font-black text-accent">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOC 9 - CTA FINAL */}
      <section className="py-20 px-4 titan-gradient-orange">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
          >
            <h2 className="text-3xl md:text-4xl font-black text-accent-foreground mb-4">
              Moins cher qu'un repas d'affaires.
            </h2>
            <p className="text-xl text-accent-foreground/80 mb-8">
              Plus puissant qu'une équipe commerciale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <TitanButton
                variant="secondary"
                size="lg"
                icon={<ArrowRight className="h-5 w-5" />}
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "Chargement..." : "Démarrer à 99 €/an"}
              </TitanButton>
              <Link to="/auth?role=facilitateur">
                <TitanButton
                  variant="ghost"
                  size="lg"
                  className="border-accent-foreground text-accent-foreground hover:bg-accent-foreground/10"
                >
                  Facilitateur — Gratuit à vie
                </TitanButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <TitanFooter />
    </div>
  );
};

export default Landing;

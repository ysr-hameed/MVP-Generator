import SEOHead from "@/components/seo-head";
import { MvpGeneratorForm } from "@/components/mvp-generator-form";

export default function MvpGenerator() {
  return (
    <>
      <SEOHead 
        title="AI MVP Generator Tool - Create Startup Plans Instantly | MVP Generator AI"
        description="Generate comprehensive MVP plans for your startup idea using AI. Get tech stacks, features, monetization strategies, and roadmaps in minutes."
        keywords="AI MVP generator, startup plan generator, business plan AI, tech stack generator, startup roadmap tool"
      />
      
      <div className="pt-16">
        <section className="section-padding">
          <div className="container-max">
            <div className="text-center mb-16">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                MVP Generator Tool
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Describe your startup idea and let our AI generate a comprehensive MVP plan in seconds.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <MvpGeneratorForm />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Copy, Share, Printer } from "lucide-react";
import jsPDF from "jspdf";

interface EnhancedPdfExportProps {
  mvpPlan: any;
  idea: string;
}

export function EnhancedPdfExport({ mvpPlan, idea }: EnhancedPdfExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const generateComprehensiveTextContent = () => {
    let content = `MVP PLAN: ${idea}\n`;
    content += `${'='.repeat(50)}\n\n`;
    
    // Executive Summary
    if (mvpPlan.executiveSummary) {
      content += `EXECUTIVE SUMMARY\n${'-'.repeat(18)}\n${mvpPlan.executiveSummary}\n\n`;
    }
    
    // Problem Statement
    if (mvpPlan.problemStatement) {
      content += `PROBLEM STATEMENT\n${'-'.repeat(17)}\n${mvpPlan.problemStatement}\n\n`;
    }
    
    // Solution Overview
    if (mvpPlan.solutionOverview) {
      content += `SOLUTION OVERVIEW\n${'-'.repeat(17)}\n${mvpPlan.solutionOverview}\n\n`;
    }
    
    // Core Features
    if (mvpPlan.coreFeatures?.length > 0) {
      content += `CORE FEATURES\n${'-'.repeat(13)}\n`;
      mvpPlan.coreFeatures.forEach((feature: string, index: number) => {
        content += `${index + 1}. ${feature}\n`;
      });
      content += `\n`;
    }
    
    // Tech Stack
    if (mvpPlan.techStack || mvpPlan.technicalRequirements) {
      const techInfo = mvpPlan.techStack || mvpPlan.technicalRequirements;
      content += `TECHNOLOGY STACK\n${'-'.repeat(16)}\n`;
      Object.entries(techInfo).forEach(([key, value]) => {
        content += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
      });
      content += `\n`;
    }
    
    // User Personas
    if (mvpPlan.userPersonas?.length > 0) {
      content += `USER PERSONAS\n${'-'.repeat(13)}\n`;
      mvpPlan.userPersonas.forEach((persona: any, index: number) => {
        content += `${index + 1}. ${persona.name || 'Persona'} - ${persona.description || ''}\n`;
        if (persona.demographics) content += `   Demographics: ${persona.demographics}\n`;
        if (persona.needs?.length > 0) {
          content += `   Needs: ${persona.needs.join(', ')}\n`;
        }
        if (persona.painPoints?.length > 0) {
          content += `   Pain Points: ${persona.painPoints.join(', ')}\n`;
        }
        content += `\n`;
      });
    }
    
    // Feature Roadmap
    if (mvpPlan.featureRoadmap) {
      content += `FEATURE ROADMAP\n${'-'.repeat(15)}\n`;
      Object.entries(mvpPlan.featureRoadmap).forEach(([phase, features]) => {
        content += `${phase.toUpperCase()}:\n`;
        if (Array.isArray(features)) {
          features.forEach((feature: string) => {
            content += `  • ${feature}\n`;
          });
        } else {
          content += `  • ${features}\n`;
        }
        content += `\n`;
      });
    }
    
    // Monetization Strategy
    if (mvpPlan.monetization || mvpPlan.monetizationStrategy) {
      const monetizationInfo = mvpPlan.monetization || mvpPlan.monetizationStrategy;
      content += `MONETIZATION STRATEGY\n${'-'.repeat(20)}\n`;
      
      if (typeof monetizationInfo === 'string') {
        content += `${monetizationInfo}\n\n`;
      } else {
        if (monetizationInfo.model || monetizationInfo.primary) {
          content += `Business Model: ${monetizationInfo.model || monetizationInfo.primary}\n`;
        }
        if (monetizationInfo.pricingModel) {
          content += `Pricing Model: ${monetizationInfo.pricingModel}\n`;
        }
        if (monetizationInfo.strategies?.length > 0) {
          content += `Revenue Strategies:\n`;
          monetizationInfo.strategies.forEach((strategy: string) => {
            content += `  • ${strategy}\n`;
          });
        }
        if (monetizationInfo.revenueProjections) {
          content += `Revenue Projections:\n`;
          Object.entries(monetizationInfo.revenueProjections).forEach(([period, amount]) => {
            content += `  ${period}: ${amount}\n`;
          });
        }
        content += `\n`;
      }
    }
    
    // Timeline
    if (mvpPlan.timeline) {
      content += `DEVELOPMENT TIMELINE\n${'-'.repeat(19)}\n`;
      Object.entries(mvpPlan.timeline).forEach(([phase, duration]) => {
        content += `${phase.charAt(0).toUpperCase() + phase.slice(1)}: ${duration}\n`;
      });
      content += `\n`;
    }
    
    // Budget Breakdown
    if (mvpPlan.budgetBreakdown || mvpPlan.estimatedCost) {
      content += `BUDGET ESTIMATE\n${'-'.repeat(15)}\n`;
      const budget = mvpPlan.budgetBreakdown?.total || mvpPlan.estimatedCost;
      
      if (budget?.initial || budget?.development) {
        content += `Initial Development: ${budget.initial || budget.development}\n`;
      }
      if (budget?.monthly) {
        content += `Monthly Operating: ${budget.monthly}\n`;
      }
      
      // Detailed budget breakdown
      if (mvpPlan.budgetBreakdown?.categories) {
        content += `\nDetailed Breakdown:\n`;
        Object.entries(mvpPlan.budgetBreakdown.categories).forEach(([category, amount]) => {
          content += `  ${category}: ${amount}\n`;
        });
      }
      content += `\n`;
    }
    
    // Market Analysis
    if (mvpPlan.marketAnalysis) {
      content += `MARKET ANALYSIS\n${'-'.repeat(15)}\n`;
      if (mvpPlan.marketAnalysis.marketSize) {
        content += `Market Size: ${mvpPlan.marketAnalysis.marketSize}\n`;
      }
      if (mvpPlan.marketAnalysis.targetMarket) {
        content += `Target Market: ${mvpPlan.marketAnalysis.targetMarket}\n`;
      }
      if (mvpPlan.marketAnalysis.competition) {
        content += `Competition: ${mvpPlan.marketAnalysis.competition}\n`;
      }
      if (mvpPlan.marketAnalysis.opportunity) {
        content += `Market Opportunity: ${mvpPlan.marketAnalysis.opportunity}\n`;
      }
      content += `\n`;
    }
    
    // Risk Assessment
    if (mvpPlan.riskMitigation?.length > 0) {
      content += `RISK ASSESSMENT & MITIGATION\n${'-'.repeat(28)}\n`;
      mvpPlan.riskMitigation.forEach((risk: any, index: number) => {
        content += `${index + 1}. RISK: ${risk.risk}\n`;
        content += `   MITIGATION: ${risk.mitigation}\n\n`;
      });
    }
    
    // Success Metrics
    if (mvpPlan.successMetrics?.length > 0) {
      content += `SUCCESS METRICS\n${'-'.repeat(15)}\n`;
      mvpPlan.successMetrics.forEach((metric: string, index: number) => {
        content += `${index + 1}. ${metric}\n`;
      });
      content += `\n`;
    }
    
    // Next Steps
    if (mvpPlan.nextSteps) {
      content += `NEXT STEPS\n${'-'.repeat(10)}\n`;
      const steps = mvpPlan.nextSteps.immediate || mvpPlan.nextSteps;
      if (Array.isArray(steps)) {
        steps.forEach((step: string, index: number) => {
          content += `${index + 1}. ${step}\n`;
        });
      }
      
      // Include medium-term and long-term steps if available
      if (mvpPlan.nextSteps.mediumTerm?.length > 0) {
        content += `\nMedium-term Goals:\n`;
        mvpPlan.nextSteps.mediumTerm.forEach((step: string, index: number) => {
          content += `${index + 1}. ${step}\n`;
        });
      }
      
      if (mvpPlan.nextSteps.longTerm?.length > 0) {
        content += `\nLong-term Vision:\n`;
        mvpPlan.nextSteps.longTerm.forEach((step: string, index: number) => {
          content += `${index + 1}. ${step}\n`;
        });
      }
      content += `\n`;
    }
    
    content += `${'='.repeat(50)}\n`;
    content += `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`;
    content += `Export Version: 2.0 - Enhanced MVP Plan\n`;
    content += `Platform: MVP Generator AI`;
    
    return content;
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 30;

      // Helper function to add text with page breaks and better formatting
      const addTextWithPageBreaks = (text: string, x: number, fontSize: number = 10, color: number[] = [0, 0, 0], isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color[0], color[1], color[2]);
        pdf.setFont("helvetica", isBold ? "bold" : "normal");
        
        // Clean and format text properly
        const cleanText = String(text || '').replace(/\n/g, ' ').trim();
        if (!cleanText) return yPosition;
        
        const lines = pdf.splitTextToSize(cleanText, pageWidth - 40);
        
        for (const line of lines) {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, x, yPosition);
          yPosition += fontSize <= 10 ? 7 : fontSize <= 14 ? 9 : 11;
        }
        yPosition += 3; // Add spacing after each section
        return yPosition;
      };

      // Title Page
      pdf.setFontSize(20);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text("MVP BUSINESS PLAN", pageWidth / 2, 40, { align: "center" });
      
      pdf.setFontSize(16);
      pdf.text(idea, pageWidth / 2, 60, { align: "center" });
      
      // Add a line
      pdf.setLineWidth(0.5);
      pdf.line(20, 80, pageWidth - 20, 80);
      
      yPosition = 100;

      // Executive Summary
      if (mvpPlan.executiveSummary) {
        yPosition = addTextWithPageBreaks("EXECUTIVE SUMMARY", 20, 16, [0, 100, 200], true);
        yPosition += 5;
        yPosition = addTextWithPageBreaks(mvpPlan.executiveSummary, 25);
        yPosition += 15;
      }

      // Problem Statement
      if (mvpPlan.problemStatement) {
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 20;
        }
        yPosition = addTextWithPageBreaks("PROBLEM STATEMENT", 20, 16, [0, 100, 200], true);
        yPosition += 5;
        yPosition = addTextWithPageBreaks(mvpPlan.problemStatement, 25);
        yPosition += 15;
      }

      // Solution Overview
      if (mvpPlan.solutionOverview) {
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 20;
        }
        yPosition = addTextWithPageBreaks("SOLUTION OVERVIEW", 20, 16, [0, 100, 200], true);
        yPosition += 5;
        yPosition = addTextWithPageBreaks(mvpPlan.solutionOverview, 25);
        yPosition += 15;
      }

      // Core Features
      if (mvpPlan.coreFeatures?.length > 0) {
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 20;
        }
        
        yPosition = addTextWithPageBreaks("CORE FEATURES", 20, 16, [0, 100, 200], true);
        yPosition += 10;
        
        mvpPlan.coreFeatures.forEach((feature: string, index: number) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
          const featureText = `${index + 1}. ${String(feature)}`;
          yPosition = addTextWithPageBreaks(featureText, 25);
          yPosition += 3;
        });
        yPosition += 15;
      }

      // Tech Stack
      if (mvpPlan.techStack || mvpPlan.technicalRequirements) {
        const techInfo = mvpPlan.techStack || mvpPlan.technicalRequirements;
        yPosition = addTextWithPageBreaks("TECHNOLOGY STACK", 20, 16, [0, 100, 200], true);
        yPosition += 5;
        
        Object.entries(techInfo).forEach(([key, value]) => {
          yPosition = addTextWithPageBreaks(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`, 25);
          yPosition += 2;
        });
        yPosition += 10;
      }

      // Monetization Strategy
      if (mvpPlan.monetization || mvpPlan.monetizationStrategy) {
        const monetizationInfo = mvpPlan.monetization || mvpPlan.monetizationStrategy;
        yPosition = addTextWithPageBreaks("MONETIZATION STRATEGY", 20, 16, [0, 100, 200], true);
        yPosition += 5;
        
        if (typeof monetizationInfo === 'string') {
          yPosition = addTextWithPageBreaks(monetizationInfo, 25);
        } else {
          if (monetizationInfo.model || monetizationInfo.primary) {
            yPosition = addTextWithPageBreaks(`Business Model: ${monetizationInfo.model || monetizationInfo.primary}`, 25);
          }
          if (monetizationInfo.pricingModel) {
            yPosition = addTextWithPageBreaks(`Pricing Model: ${monetizationInfo.pricingModel}`, 25);
          }
          if (monetizationInfo.strategies?.length > 0) {
            yPosition = addTextWithPageBreaks("Revenue Strategies:", 25, 12, [0, 0, 0], true);
            monetizationInfo.strategies.forEach((strategy: string) => {
              yPosition = addTextWithPageBreaks(`• ${strategy}`, 30);
            });
          }
        }
        yPosition += 10;
      }

      // Timeline
      if (mvpPlan.timeline) {
        yPosition = addTextWithPageBreaks("DEVELOPMENT TIMELINE", 20, 16, [0, 100, 200], true);
        yPosition += 5;
        
        Object.entries(mvpPlan.timeline).forEach(([phase, duration]) => {
          yPosition = addTextWithPageBreaks(`${phase.charAt(0).toUpperCase() + phase.slice(1)}: ${duration}`, 25);
          yPosition += 2;
        });
        yPosition += 10;
      }

      // Budget
      if (mvpPlan.budgetBreakdown || mvpPlan.estimatedCost) {
        yPosition = addTextWithPageBreaks("BUDGET ESTIMATE", 20, 16, [0, 100, 200], true);
        yPosition += 5;
        
        const budget = mvpPlan.budgetBreakdown?.total || mvpPlan.estimatedCost;
        if (budget?.initial || budget?.development) {
          yPosition = addTextWithPageBreaks(`Initial Development: ${budget.initial || budget.development}`, 25);
        }
        if (budget?.monthly) {
          yPosition = addTextWithPageBreaks(`Monthly Operating: ${budget.monthly}`, 25);
        }
        yPosition += 10;
      }

      // Next Steps
      if (mvpPlan.nextSteps) {
        yPosition = addTextWithPageBreaks("NEXT STEPS", 20, 16, [0, 100, 200], true);
        yPosition += 5;
        
        const steps = mvpPlan.nextSteps.immediate || mvpPlan.nextSteps;
        if (Array.isArray(steps)) {
          steps.forEach((step: string, index: number) => {
            yPosition = addTextWithPageBreaks(`${index + 1}. ${step}`, 25);
            yPosition += 2;
          });
        }
        yPosition += 10;
      }

      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Generated by MVP Generator AI - Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      }

      // Save PDF
      const fileName = `mvp-plan-${idea.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Downloaded Successfully",
        description: "Your comprehensive MVP plan has been exported as a professional PDF.",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const textContent = generateComprehensiveTextContent();
      await navigator.clipboard.writeText(textContent);
      toast({
        title: "Copied to Clipboard",
        description: "Complete MVP plan has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareViaMail = () => {
    const subject = `MVP Business Plan: ${idea}`;
    const body = `Hi there!\n\nI've created a comprehensive MVP business plan for my startup idea: "${idea}"\n\nHere's the complete plan:\n\n${generateComprehensiveTextContent()}\n\nBest regards`;
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const printPlan = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MVP Plan: ${idea}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            h1 { color: #2563eb; border-bottom: 2px solid #2563eb; }
            h2 { color: #1e40af; margin-top: 30px; }
            .feature-list { margin-left: 20px; }
            .section { margin-bottom: 30px; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${generateComprehensiveTextContent()}</pre>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="flex flex-wrap gap-3 mt-6">
      <Button 
        onClick={exportToPDF}
        disabled={isExporting}
        size="sm"
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        <FileDown className="w-4 h-4 mr-2" />
        {isExporting ? "Generating PDF..." : "Export PDF"}
      </Button>
      
      <Button 
        onClick={copyToClipboard}
        variant="outline"
        size="sm"
      >
        <Copy className="w-4 h-4 mr-2" />
        Copy All Text
      </Button>
      
      <Button 
        onClick={shareViaMail}
        variant="outline"
        size="sm"
      >
        <Share className="w-4 h-4 mr-2" />
        Share via Email
      </Button>
      
      <Button 
        onClick={printPlan}
        variant="outline"
        size="sm"
      >
        <Printer className="w-4 h-4 mr-2" />
        Print Plan
      </Button>
    </div>
  );
}
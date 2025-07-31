import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Share2, Copy, Printer, FileJson } from "lucide-react";
import jsPDF from "jspdf";

interface ExportOptionsProps {
  mvpPlan: any;
  idea: string;
}

export function ExportOptions({ mvpPlan, idea }: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to add text with page breaks
      const addTextWithPageBreaks = (text: string, x: number, fontSize: number = 10, color: number[] = [0, 0, 0]) => {
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color[0], color[1], color[2]);
        
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

      // Title page
      pdf.setFontSize(24);
      pdf.setTextColor(0, 100, 200);
      pdf.text("MVP Business Plan", pageWidth / 2, 40, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(60, 60, 60);
      yPosition = 60;
      addTextWithPageBreaks(idea, 20, 14, [60, 60, 60]);
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, pageHeight - 20);

      // New page for content
      pdf.addPage();
      yPosition = 20;

      // Core Features
      if (mvpPlan.coreFeatures?.length > 0) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }
        yPosition = addTextWithPageBreaks("CORE FEATURES", 20, 16, [0, 100, 200]);
        yPosition += 5;
        
        mvpPlan.coreFeatures.forEach((feature: string, index: number) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
          yPosition = addTextWithPageBreaks(`${index + 1}. ${String(feature)}`, 25, 10);
        });
        yPosition += 10;
      }

      // Tech Stack
      if (mvpPlan.techStack) {
        yPosition = addTextWithPageBreaks("TECHNOLOGY STACK", 20, 16, [0, 100, 200]);
        yPosition += 5;
        
        Object.entries(mvpPlan.techStack).forEach(([key, value]) => {
          yPosition = addTextWithPageBreaks(`${key.toUpperCase()}: ${value}`, 25);
          yPosition += 2;
        });
        yPosition += 10;
      }

      // Technical Requirements
      if (mvpPlan.technicalRequirements) {
        yPosition = addTextWithPageBreaks("TECHNICAL REQUIREMENTS", 20, 16, [0, 100, 200]);
        yPosition += 5;
        
        Object.entries(mvpPlan.technicalRequirements).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            yPosition = addTextWithPageBreaks(`${key.toUpperCase()}:`, 25, 12, [0, 0, 0]);
            value.forEach((item: string) => {
              yPosition = addTextWithPageBreaks(`• ${item}`, 30);
            });
          } else {
            yPosition = addTextWithPageBreaks(`${key.toUpperCase()}: ${value}`, 25);
          }
          yPosition += 2;
        });
        yPosition += 10;
      }

      // Budget Breakdown
      if (mvpPlan.budgetBreakdown) {
        yPosition = addTextWithPageBreaks("BUDGET BREAKDOWN", 20, 16, [0, 100, 200]);
        yPosition += 5;
        
        Object.entries(mvpPlan.budgetBreakdown).forEach(([key, value]) => {
          yPosition = addTextWithPageBreaks(`${key}: $${value}`, 25);
          yPosition += 2;
        });
        yPosition += 10;
      }

      // Market Analysis
      if (mvpPlan.marketAnalysis) {
        yPosition = addTextWithPageBreaks("MARKET ANALYSIS", 20, 16, [0, 100, 200]);
        yPosition += 5;
        
        Object.entries(mvpPlan.marketAnalysis).forEach(([key, value]) => {
          yPosition = addTextWithPageBreaks(`${key.replace(/([A-Z])/g, ' $1').toUpperCase()}: ${value}`, 25);
          yPosition += 2;
        });
        yPosition += 10;
      }

      // User Personas
      if (mvpPlan.userPersonas?.length > 0) {
        yPosition = addTextWithPageBreaks("USER PERSONAS", 20, 16, [0, 100, 200]);
        yPosition += 5;
        
        mvpPlan.userPersonas.forEach((persona: any, index: number) => {
          yPosition = addTextWithPageBreaks(`PERSONA ${index + 1}: ${persona.name}`, 25, 12, [0, 0, 0]);
          yPosition = addTextWithPageBreaks(`Age: ${persona.age}`, 30);
          yPosition = addTextWithPageBreaks(`Occupation: ${persona.occupation}`, 30);
          yPosition = addTextWithPageBreaks(`Description: ${persona.description}`, 30);
          if (persona.painPoints?.length > 0) {
            yPosition = addTextWithPageBreaks("Pain Points:", 30, 10, [100, 0, 0]);
            persona.painPoints.forEach((point: string) => {
              yPosition = addTextWithPageBreaks(`• ${point}`, 35);
            });
          }
          yPosition += 5;
        });
        yPosition += 10;
      }

      // Feature Roadmap
      if (mvpPlan.featureRoadmap) {
        yPosition = addTextWithPageBreaks("FEATURE ROADMAP", 20, 16, [0, 100, 200]);
        yPosition += 5;
        
        Object.entries(mvpPlan.featureRoadmap).forEach(([phase, features]) => {
          yPosition = addTextWithPageBreaks(`${phase.toUpperCase()}:`, 25, 12, [0, 0, 0]);
          if (Array.isArray(features)) {
            features.forEach((feature: string) => {
              yPosition = addTextWithPageBreaks(`• ${feature}`, 30);
            });
          } else {
            yPosition = addTextWithPageBreaks(`${features}`, 30);
          }
          yPosition += 5;
        });
        yPosition += 10;
      }

      // Monetization Strategy
      if (mvpPlan.monetization) {
        yPosition = addTextWithPageBreaks("MONETIZATION STRATEGY", 20, 16, [0, 100, 200]);
        yPosition += 5;
        
        if (mvpPlan.monetization.model) {
          yPosition = addTextWithPageBreaks(`Business Model: ${mvpPlan.monetization.model}`, 25);
        }
        if (mvpPlan.monetization.strategies?.length > 0) {
          yPosition = addTextWithPageBreaks("Revenue Strategies:", 25, 12, [0, 0, 0]);
          mvpPlan.monetization.strategies.forEach((strategy: string) => {
            yPosition = addTextWithPageBreaks(`• ${strategy}`, 30);
          });
        }
        yPosition += 10;
      }

      // Risk Mitigation
      if (mvpPlan.riskMitigation?.length > 0) {
        yPosition = addTextWithPageBreaks("RISK MITIGATION", 20, 16, [0, 100, 200]);
        yPosition += 5;
        
        mvpPlan.riskMitigation.forEach((risk: any, index: number) => {
          yPosition = addTextWithPageBreaks(`RISK ${index + 1}: ${risk.risk}`, 25, 12, [100, 0, 0]);
          yPosition = addTextWithPageBreaks(`Mitigation: ${risk.mitigation}`, 30);
          yPosition += 3;
        });
      }

      // Save PDF
      const fileName = `mvp-plan-${idea.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Downloaded",
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

  const exportToJSON = () => {
    try {
      const exportData = {
        idea,
        mvpPlan,
        exportedAt: new Date().toISOString(),
        version: "1.0"
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `mvp-plan-${idea.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "JSON Downloaded",
        description: "Your MVP plan data has been exported as JSON.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export JSON. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      const textContent = generateTextContent();
      await navigator.clipboard.writeText(textContent);
      toast({
        title: "Copied to Clipboard",
        description: "MVP plan has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const printPlan = () => {
    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const sharePlan = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `MVP Plan: ${idea}`,
          text: `Check out my MVP plan: ${idea}`,
          url: window.location.href
        });
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Page link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Failed to share. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateTextContent = () => {
    let content = `MVP BUSINESS PLAN\n\n`;
    content += `Idea: ${idea}\n`;
    content += `Generated: ${new Date().toLocaleDateString()}\n\n`;

    if (mvpPlan.coreFeatures?.length > 0) {
      content += `CORE FEATURES:\n`;
      mvpPlan.coreFeatures.forEach((feature: string, index: number) => {
        content += `${index + 1}. ${feature}\n`;
      });
      content += `\n`;
    }

    if (mvpPlan.techStack) {
      content += `TECHNOLOGY STACK:\n`;
      Object.entries(mvpPlan.techStack).forEach(([key, value]) => {
        content += `${key.toUpperCase()}: ${value}\n`;
      });
      content += `\n`;
    }

    if (mvpPlan.budgetBreakdown) {
      content += `BUDGET BREAKDOWN:\n`;
      Object.entries(mvpPlan.budgetBreakdown).forEach(([key, value]) => {
        content += `${key}: $${value}\n`;
      });
      content += `\n`;
    }

    return content;
  };

  const generatePrintContent = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MVP Plan - ${idea}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #0066cc; border-bottom: 2px solid #0066cc; }
          h2 { color: #333; margin-top: 30px; }
          .section { margin-bottom: 30px; }
          .feature-item { margin: 10px 0; padding: 8px; background: #f5f5f5; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>MVP Business Plan</h1>
        <p><strong>Idea:</strong> ${idea}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        
        ${mvpPlan.coreFeatures?.length > 0 ? `
          <div class="section">
            <h2>Core Features</h2>
            ${mvpPlan.coreFeatures.map((feature: string, index: number) => 
              `<div class="feature-item">${index + 1}. ${feature}</div>`
            ).join('')}
          </div>
        ` : ''}
        
        ${mvpPlan.techStack ? `
          <div class="section">
            <h2>Technology Stack</h2>
            ${Object.entries(mvpPlan.techStack).map(([key, value]) => 
              `<p><strong>${key.toUpperCase()}:</strong> ${value}</p>`
            ).join('')}
          </div>
        ` : ''}
        
        ${mvpPlan.budgetBreakdown ? `
          <div class="section">
            <h2>Budget Breakdown</h2>
            ${Object.entries(mvpPlan.budgetBreakdown).map(([key, value]) => 
              `<p><strong>${key}:</strong> $${value}</p>`
            ).join('')}
          </div>
        ` : ''}
      </body>
      </html>
    `;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Options
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          onClick={exportToPDF}
          disabled={isExporting}
          className="flex flex-col items-center gap-3 h-auto py-6"
          variant="outline"
        >
          <FileText className="w-8 h-8" />
          <div className="text-center">
            <div className="text-base font-medium">Download PDF</div>
            <div className="text-xs text-muted-foreground">Complete business plan</div>
          </div>
          {isExporting && <Badge variant="secondary" className="text-xs">Generating...</Badge>}
        </Button>

        <Button
          onClick={exportToJSON}
          className="flex flex-col items-center gap-3 h-auto py-6"
          variant="outline"
        >
          <FileJson className="w-8 h-8" />
          <div className="text-center">
            <div className="text-base font-medium">Download JSON</div>
            <div className="text-xs text-muted-foreground">Structured data format</div>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}
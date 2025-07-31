import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Share, 
  Copy, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  Target, 
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Zap,
  Mail,
  FileText,
  Printer
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface EnhancedMvpResultsProps {
  mvpPlan: any;
  idea: string;
  onNewGeneration: () => void;
}

export function EnhancedMvpResults({ mvpPlan, idea, onNewGeneration }: EnhancedMvpResultsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const exportToPDF = async () => {
    try {
      const element = document.getElementById('mvp-results');
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MVP-Plan-${Date.now()}.pdf`);
      
      toast({
        title: "Success!",
        description: "MVP plan exported to PDF successfully"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      const planText = `
MVP Plan for: ${idea}

CORE FEATURES:
${mvpPlan.coreFeatures?.map((feature: string) => `• ${feature}`).join('\n') || 'N/A'}

TECHNICAL REQUIREMENTS:
• Frontend: ${mvpPlan.technicalRequirements?.frontend || 'N/A'}
• Backend: ${mvpPlan.technicalRequirements?.backend || 'N/A'}
• Database: ${mvpPlan.technicalRequirements?.database || 'N/A'}

MONETIZATION:
• Primary: ${mvpPlan.monetizationStrategy?.primary || 'N/A'}
• Pricing: ${mvpPlan.monetizationStrategy?.pricingModel || 'N/A'}

TIMELINE:
• MVP: ${mvpPlan.timeline?.mvp || 'N/A'}
• Launch: ${mvpPlan.timeline?.launch || 'N/A'}

BUDGET:
• Initial: ${mvpPlan.budgetBreakdown?.total?.initial || mvpPlan.estimatedCost?.development || 'N/A'}
• Monthly: ${mvpPlan.budgetBreakdown?.total?.monthly || mvpPlan.estimatedCost?.monthly || 'N/A'}

NEXT STEPS:
${mvpPlan.nextSteps?.immediate?.map((step: string) => `• ${step}`).join('\n') || 
   mvpPlan.nextSteps?.map((step: string) => `• ${step}`).join('\n') || 'N/A'}
`;

      await navigator.clipboard.writeText(planText);
      toast({
        title: "Copied!",
        description: "MVP plan copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const shareViaMail = () => {
    const subject = `MVP Plan for: ${idea}`;
    const body = `Check out this comprehensive MVP plan I generated for my startup idea: ${idea}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <div id="mvp-results" className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Your MVP Plan</h2>
          <p className="text-muted-foreground mt-1">Comprehensive strategy for: {idea}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={shareViaMail}>
            <Mail className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Initial Budget</p>
                    <p className="text-2xl font-bold">{mvpPlan.budgetBreakdown?.total?.initial || mvpPlan.estimatedCost?.development || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">MVP Timeline</p>
                    <p className="text-2xl font-bold">{mvpPlan.timeline?.mvp || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Revenue (Year 1)</p>
                    <p className="text-2xl font-bold">{mvpPlan.monetizationStrategy?.revenueProjections?.year1 || 'TBD'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Target Market</p>
                    <p className="text-sm font-bold">{mvpPlan.marketAnalysis?.marketSize || 'Defined'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Core Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mvpPlan.coreFeatures?.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                )) || <p className="text-muted-foreground">No core features defined</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Technical Architecture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Frontend</h4>
                  <p className="text-sm text-muted-foreground">{mvpPlan.technicalRequirements?.frontend || mvpPlan.techStack?.frontend || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Backend</h4>
                  <p className="text-sm text-muted-foreground">{mvpPlan.technicalRequirements?.backend || mvpPlan.techStack?.backend || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Database</h4>
                  <p className="text-sm text-muted-foreground">{mvpPlan.technicalRequirements?.database || mvpPlan.techStack?.database || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Hosting</h4>
                  <p className="text-sm text-muted-foreground">{mvpPlan.technicalRequirements?.hosting || mvpPlan.techStack?.hosting || 'Not specified'}</p>
                </div>
              </div>

              {mvpPlan.technicalRequirements?.thirdPartyServices && (
                <div>
                  <h4 className="font-semibold mb-2">Third-Party Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {mvpPlan.technicalRequirements.thirdPartyServices.map((service: string, index: number) => (
                      <Badge key={index} variant="secondary">{service}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monetization Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Primary Revenue</h4>
                  <p className="text-sm text-muted-foreground">{mvpPlan.monetizationStrategy?.primary || mvpPlan.monetizationStrategy || 'Not defined'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Pricing Model</h4>
                  <p className="text-sm text-muted-foreground">{mvpPlan.monetizationStrategy?.pricingModel || 'To be determined'}</p>
                </div>
                {mvpPlan.monetizationStrategy?.revenueProjections && (
                  <div>
                    <h4 className="font-semibold mb-2">Revenue Projections</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>3 Months:</span>
                        <span className="font-medium">{mvpPlan.monetizationStrategy.revenueProjections.month3}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>6 Months:</span>
                        <span className="font-medium">{mvpPlan.monetizationStrategy.revenueProjections.month6}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>1 Year:</span>
                        <span className="font-medium">{mvpPlan.monetizationStrategy.revenueProjections.year1}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Target Market</h4>
                  <p className="text-sm text-muted-foreground">{mvpPlan.marketAnalysis?.targetMarket || 'Not defined'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Competitive Advantage</h4>
                  <p className="text-sm text-muted-foreground">{mvpPlan.marketAnalysis?.competitiveAdvantage || mvpPlan.marketAnalysis?.opportunity || 'To be identified'}</p>
                </div>
                {mvpPlan.marketAnalysis?.competition && (
                  <div>
                    <h4 className="font-semibold mb-2">Key Competitors</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(mvpPlan.marketAnalysis.competition) ? 
                        mvpPlan.marketAnalysis.competition.map((competitor: string, index: number) => (
                          <Badge key={index} variant="outline">{competitor}</Badge>
                        )) : 
                        <Badge variant="outline">{mvpPlan.marketAnalysis.competition}</Badge>
                      }
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Development Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mvpPlan.timeline && Object.entries(mvpPlan.timeline).map(([phase, duration], index) => (
                  <div key={phase} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold capitalize">{phase.replace(/([A-Z])/g, ' $1').trim()}</h4>
                      <p className="text-sm text-muted-foreground">{duration as string}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {mvpPlan.featureRoadmap && (
            <Card>
              <CardHeader>
                <CardTitle>Feature Roadmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(mvpPlan.featureRoadmap).map(([phase, features]) => (
                    <div key={phase} className="space-y-2">
                      <h4 className="font-semibold capitalize">{phase.replace(/([A-Z])/g, ' $1').trim()}</h4>
                      <ul className="space-y-1">
                        {Array.isArray(features) && features.map((feature: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start">
                            <span className="w-1 h-1 rounded-full bg-primary mt-2 mr-2 flex-shrink-0"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          {mvpPlan.metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(mvpPlan.metrics).map(([category, targets]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {Array.isArray(targets) && targets.map((target: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{target}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks" className="space-y-6">
          {mvpPlan.riskMitigation ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(mvpPlan.riskMitigation).map(([category, risks]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 capitalize">
                      <AlertTriangle className="w-4 h-4" />
                      {category} Risks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {Array.isArray(risks) && risks.map((risk: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-1 h-1 rounded-full bg-red-500 mt-2 mr-2 flex-shrink-0"></span>
                          <span className="text-sm">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : mvpPlan.marketAnalysis?.risks ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Identified Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mvpPlan.marketAnalysis.risks.map((risk: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{risk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No specific risks identified in this plan.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Next Steps Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mvpPlan.nextSteps?.immediate || mvpPlan.nextSteps ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mvpPlan.nextSteps.immediate && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Immediate (This Week)</h4>
                  <ul className="space-y-1">
                    {mvpPlan.nextSteps.immediate.map((step: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <span className="w-1 h-1 rounded-full bg-red-500 mt-2 mr-2 flex-shrink-0"></span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {mvpPlan.nextSteps.shortTerm && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Short Term (This Month)</h4>
                  <ul className="space-y-1">
                    {mvpPlan.nextSteps.shortTerm.map((step: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <span className="w-1 h-1 rounded-full bg-orange-500 mt-2 mr-2 flex-shrink-0"></span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {mvpPlan.nextSteps.mediumTerm && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Medium Term (3 Months)</h4>
                  <ul className="space-y-1">
                    {mvpPlan.nextSteps.mediumTerm.map((step: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <span className="w-1 h-1 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {mvpPlan.nextSteps.longTerm && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Long Term (6-12 Months)</h4>
                  <ul className="space-y-1">
                    {mvpPlan.nextSteps.longTerm.map((step: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <span className="w-1 h-1 rounded-full bg-green-500 mt-2 mr-2 flex-shrink-0"></span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {Array.isArray(mvpPlan.nextSteps) && (
                <div className="col-span-full">
                  <h4 className="font-semibold mb-2">Action Items</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {mvpPlan.nextSteps.map((step: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No specific next steps provided.</p>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button onClick={onNewGeneration} className="flex-1">
          Generate New Plan
        </Button>
        <Button variant="outline" onClick={exportToPDF} className="flex-1">
          <FileText className="w-4 h-4 mr-2" />
          Export Full Report
        </Button>
      </div>
    </div>
  );
}
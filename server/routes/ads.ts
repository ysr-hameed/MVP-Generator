import { Router } from "express";
import { getStorage } from "../storage";

const router = Router();

interface AdSettings {
  enableAds: boolean;
  adCount: 'low' | 'medium' | 'high';
  showAdLabels: boolean;
}

interface Advertisement {
  id: string;
  name: string;
  position: string;
  isActive: boolean;
  adCode: string;
  width?: number;
  height?: number;
}

// Get ad settings
router.get("/api/admin/ad-settings", async (req, res) => {
  try {
    const storage = await getStorage();
    
    // Default ad settings - always show ads with medium count
    const defaultSettings: AdSettings = {
      enableAds: true,
      adCount: 'medium',
      showAdLabels: true
    };

    res.json(defaultSettings);
  } catch (error) {
    console.error("Error fetching ad settings:", error);
    // Return default settings on error
    res.json({
      enableAds: true,
      adCount: 'medium',
      showAdLabels: true
    });
  }
});

// Get advertisements
router.get("/api/advertisements", async (req, res) => {
  try {
    // Sample advertisements to demonstrate functionality
    const sampleAds: Advertisement[] = [
      {
        id: "sample-header-1",
        name: "Header Ad",
        position: "header",
        isActive: true,
        adCode: `
var atOptions = {
  'key': '55520cbc4a650e9153cfafbd7c723bc8',
  'format': 'iframe',
  'height': 50,
  'width': 320,
  'params': {}
};
document.write('<scr' + 'ipt type="text/javascript" src="//www.highperformanceformat.com/' + atOptions.key + '/invoke.js"></scr' + 'ipt>');
`,
        width: 320,
        height: 50
      },
      {
        id: "sample-sidebar-1",
        name: "Sidebar Ad 1",
        position: "sidebar",
        isActive: true,
        adCode: `
var atOptions = {
  'key': '9a3ef597fec948bcaa967a2b31ad6309',
  'format': 'iframe',
  'height': 250,
  'width': 300,
  'params': {}
};
document.write('<scr' + 'ipt type="text/javascript" src="//www.highperformanceformat.com/' + atOptions.key + '/invoke.js"></scr' + 'ipt>');
`,
        width: 300,
        height: 250
      },
      {
        id: "sample-sidebar-2",
        name: "Sidebar Ad 2",
        position: "sidebar",
        isActive: true,
        adCode: `<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 15px; text-align: center; color: white; border-radius: 8px; margin: 10px 0; min-height: 200px; display: flex; flex-direction: column; justify-content: center;">
          <h4 style="margin: 0; font-size: 16px;">🎯 Marketing Tools</h4>
          <p style="margin: 10px 0; font-size: 14px;">Boost your startup's growth</p>
          <a href="#" style="color: white; text-decoration: underline;">Explore Tools</a>
        </div>`,
        width: 300,
        height: 250
      },
      {
        id: "sample-content-1",
        name: "Content Ad",
        position: "content",
        isActive: true,
        adCode: `
var atOptions = {
  'key': '55520cbc4a650e9153cfafbd7c723bc8',
  'format': 'iframe',
  'height': 90,
  'width': 728,
  'params': {}
};
document.write('<scr' + 'ipt type="text/javascript" src="//www.highperformanceformat.com/' + atOptions.key + '/invoke.js"></scr' + 'ipt>');
`,
        width: 728,
        height: 90
      },
      {
        id: "sample-footer-1",
        name: "Footer Ad 1",
        position: "footer",
        isActive: true,
        adCode: `<div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 20px; text-align: center; color: #333; border-radius: 8px; margin: 10px;">
          <h3 style="margin: 0; font-size: 18px;">🌟 Premium Features</h3>
          <p style="margin: 10px 0;">Unlock advanced MVP generation capabilities</p>
          <a href="#" style="color: #333; text-decoration: underline; font-weight: bold;">Upgrade Now</a>
        </div>`,
        width: 728,
        height: 90
      },
      {
        id: "sample-footer-2",
        name: "Footer Ad 2",
        position: "footer",
        isActive: true,
        adCode: `<div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 20px; text-align: center; color: #333; border-radius: 8px; margin: 10px;">
          <h3 style="margin: 0; font-size: 18px;">🤝 Partner Network</h3>
          <p style="margin: 10px 0;">Connect with investors and co-founders</p>
          <a href="#" style="color: #333; text-decoration: underline; font-weight: bold;">Join Network</a>
        </div>`,
        width: 728,
        height: 90
      },
      {
        id: "sample-generator-top-1",
        name: "Generator Top Ad",
        position: "generator-top",
        isActive: true,
        adCode: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; text-align: center; color: white; border-radius: 8px; margin: 10px 0;">
          <h4 style="margin: 0; font-size: 16px;">🎯 Pro Templates</h4>
          <p style="margin: 5px 0; font-size: 14px;">Get industry-specific MVP templates</p>
        </div>`,
        width: 600,
        height: 100
      },
      {
        id: "sample-generator-bottom-1",
        name: "Generator Bottom Ad",
        position: "generator-bottom",
        isActive: true,
        adCode: `<div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 15px; text-align: center; color: #333; border-radius: 8px; margin: 10px 0;">
          <h4 style="margin: 0; font-size: 16px;">📈 Growth Hacking</h4>
          <p style="margin: 5px 0; font-size: 14px;">Learn proven strategies to scale your MVP</p>
        </div>`,
        width: 600,
        height: 100
      }
    ];

    res.json(sampleAds);
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    res.status(500).json({ message: "Failed to fetch advertisements" });
  }
});

export default router;
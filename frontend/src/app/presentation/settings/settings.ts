import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SettingsService } from './settings-service';
import { Imagelogo } from '../../assests/logo';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './settings.html',
})
export class Settings implements OnInit {
  logo: string = Imagelogo;
  
  userId: string = '';
  email: string = '';
  userName: string = '';
  userInitial: string = '';
  report: string = '';
  hasReport: boolean = false;

  // Parsed report sections
  parsedReport = {
    coreEssence: '',
    behavioralMasterclass: '',
    powerPivot: ''
  };

  // Behavioral traits with real scores
  behavioralTraits: any[] = [];
  archetype = { name: '', emoji: '', tagline: '', gradient: '', description: '' };
  cognitiveMetrics: any[] = [];
  overallScore: number = 0;

  isLoading: boolean = true;
  hasError: boolean = false;

  constructor(private router: Router, private settingsService: SettingsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const storedId = localStorage.getItem('id');
    const loginStatus = localStorage.getItem('loginStatus');

    if (!storedId || loginStatus !== 'true') {
      this.router.navigate(['/signup']);
      return;
    }

    this.userId = storedId;
    this.loadUserData(parseInt(storedId, 10));
  }

  loadUserData(userId: number) {
    console.log("Fetching profile for user:", userId);
    this.settingsService.getUserProfile(userId).subscribe({
      next: (user: any) => {
        console.log("Successfully fetched user profile:", user);
        this.email = user.email || '';
        this.userName = this.extractNameFromEmail(this.email);
        this.userInitial = this.email[0]?.toUpperCase() || '?';

        // Fetch report separately from the Report API
        this.settingsService.getReportByUserId(userId).subscribe({
          next: (reportRes: any) => {
            console.log("Report response:", reportRes);
            this.report = reportRes.hasReport ? (reportRes.data || '') : '';
            this.hasReport = !!this.report && this.report.trim().length > 0;

            if (this.hasReport) {
              console.log("User has report, parsing...");
              try {
                const aiScores = this.extractAIScores(this.report);
                const cleanReport = this.report.replace(/SCORES_START[\s\S]*?SCORES_END/i, '').trim();
                this.parsedReport = this.parseReport(cleanReport);
                this.behavioralTraits = this.getBehavioralTraits(cleanReport, aiScores);
                this.archetype = this.getArchetype(this.behavioralTraits);
                this.cognitiveMetrics = this.getCognitiveMetrics(aiScores);
                this.overallScore = Math.round(
                  this.behavioralTraits.reduce((sum: number, t: any) => sum + t.score, 0) / this.behavioralTraits.length
                );
                console.log("Parsing successful!");
              } catch (e) {
                console.error("Error during parsing:", e);
              }
            } else {
              console.log("User does not have a report yet.");
            }

            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error("Error fetching report:", err);
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error("Error fetching user profile:", err);
        this.hasError = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  extractNameFromEmail(email: string): string {
    const localPart = email.split('@')[0] || '';
    // Clean up: replace dots, underscores, numbers with spaces, then capitalize
    return localPart
      .replace(/[._\-+]/g, ' ')
      .replace(/\d+/g, '')
      .trim()
      .split(' ')
      .filter(w => w.length > 0)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ') || 'User';
  }

  extractAIScores(reportText: string): {[key: string]: number} {
    const scores: {[key: string]: number} = {};
    const match = reportText.match(/SCORES_START([\s\S]*?)SCORES_END/i);
    if (!match) return scores;
    const lines = match[1].split('\n').filter(l => l.trim().length > 0);
    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const scoreStr = parts[1].trim().replace(/[^\d]/g, '');
        const score = parseInt(scoreStr, 10);
        if (!isNaN(score) && score >= 0 && score <= 100) {
          scores[name] = score;
        }
      }
    }
    return scores;
  }

  parseReport(reportText: string) {
    let coreEssence = '', behavioralMasterclass = '', powerPivot = '';

    // New concise format: CORE TRAITS / BEHAVIORAL PATTERNS / STRENGTHS & BLIND SPOTS
    const ct = reportText.indexOf("CORE TRAITS:");
    const bp = reportText.indexOf("BEHAVIORAL PATTERNS:");
    const sb = reportText.indexOf("STRENGTHS & BLIND SPOTS:");

    if (ct !== -1 && bp !== -1 && sb !== -1) {
      coreEssence = reportText.substring(ct + "CORE TRAITS:".length, bp).trim();
      behavioralMasterclass = reportText.substring(bp + "BEHAVIORAL PATTERNS:".length, sb).trim();
      powerPivot = reportText.substring(sb + "STRENGTHS & BLIND SPOTS:".length).trim();
    } else {
      // Legacy format: 1. The Core Essence / 2. Behavioral Masterclass / 3. The Power & The Pivot
      const ci = reportText.indexOf("1. The Core Essence");
      const bi = reportText.indexOf("2. Behavioral Masterclass");
      const pi = reportText.indexOf("3. The Power & The Pivot");
      if (ci !== -1 && bi !== -1 && pi !== -1) {
        coreEssence = reportText.substring(ci + 19, bi).trim();
        behavioralMasterclass = reportText.substring(bi + 25, pi).trim();
        powerPivot = reportText.substring(pi + 24).trim();
      } else {
        const paragraphs = reportText.split(/\n\n+/);
        if (paragraphs.length >= 3) {
          coreEssence = paragraphs[0];
          behavioralMasterclass = paragraphs[1];
          powerPivot = paragraphs.slice(2).join('\n\n');
        } else {
          coreEssence = reportText;
        }
      }
    }
    return {
      coreEssence: coreEssence.replace(/^[:\-\s\n*]+/, '').trim(),
      behavioralMasterclass: behavioralMasterclass.replace(/^[:\-\s\n*]+/, '').trim(),
      powerPivot: powerPivot.replace(/^[:\-\s\n*]+/, '').trim()
    };
  }

  getBehavioralTraits(reportText: string, aiScores: {[key: string]: number}) {
    const lc = reportText.toLowerCase();
    const totalWords = lc.split(/\s+/).length;
    const count = (words: string[]) => {
      let c = 0;
      words.forEach(w => { c += (lc.match(new RegExp('\\b' + w + '\\b', 'gi')) || []).length; });
      return c;
    };

    const traits = [
      { name: 'Empathy & Collaboration', emoji: '🤝', keywords: ['empathy','compassion','connect','team','care','support','collaborate'],
        barGradient: 'linear-gradient(90deg, #ec4899, #f43f5e)', bgColor: '#fff1f2', badgeBg: '#ffe4e6', badgeText: '#be123c',
        description: 'Connecting with and understanding others' },
      { name: 'Resilience & Adaptability', emoji: '🧗', keywords: ['resilience','adaptable','challenge','grit','flexible','pressure','persevere'],
        barGradient: 'linear-gradient(90deg, #10b981, #14b8a6)', bgColor: '#f0fdfa', badgeBg: '#ccfbf1', badgeText: '#0f766e',
        description: 'Withstanding pressure and adapting to change' },
      { name: 'Analytical Depth', emoji: '🔍', keywords: ['analytical','logic','strategy','problem','solve','rational','structured'],
        barGradient: 'linear-gradient(90deg, #3b82f6, #6366f1)', bgColor: '#eef2ff', badgeBg: '#e0e7ff', badgeText: '#4338ca',
        description: 'Logical reasoning and problem-solving' },
      { name: 'Creativity & Innovation', emoji: '💡', keywords: ['creative','imagination','innovative','ideas','curious','original','inventive'],
        barGradient: 'linear-gradient(90deg, #f59e0b, #f97316)', bgColor: '#fffbeb', badgeBg: '#fef3c7', badgeText: '#b45309',
        description: 'Original thinking and ideation' },
      { name: 'Leadership & Influence', emoji: '👑', keywords: ['lead','influence','mentor','impact','drive','confident','inspire'],
        barGradient: 'linear-gradient(90deg, #a855f7, #8b5cf6)', bgColor: '#faf5ff', badgeBg: '#f3e8ff', badgeText: '#7e22ce',
        description: 'Taking charge and inspiring others' }
    ];

    return traits.map(t => {
      let score = aiScores[t.name] !== undefined ? aiScores[t.name]
        : Math.min(95, Math.max(30, Math.round((count(t.keywords) / Math.max(totalWords, 1)) * 2500 + 40)));
      let level = score >= 85 ? 'Outstanding' : score >= 70 ? 'Strong' : score >= 55 ? 'Moderate' : score >= 40 ? 'Developing' : 'Low';
      return { ...t, score, level };
    });
  }

  getArchetype(traits: any[]) {
    const top = [...traits].sort((a, b) => b.score - a.score)[0];
    const map: any = {
      'Empathy & Collaboration': { name: 'The Harmonizer', emoji: '🤝', tagline: 'Empathetic Bridge-Builder', gradient: 'linear-gradient(135deg, #f43f5e, #ec4899)', description: 'Driven by deep connection and collaborative spirit.' },
      'Resilience & Adaptability': { name: 'The Catalyst', emoji: '🧗', tagline: 'Agile Pathfinder', gradient: 'linear-gradient(135deg, #14b8a6, #10b981)', description: 'Defined by relentless grit and high versatility.' },
      'Analytical Depth': { name: 'The Strategist', emoji: '🔍', tagline: 'Logical Thinker', gradient: 'linear-gradient(135deg, #6366f1, #3b82f6)', description: 'Deep structured reasoning and problem-solving focus.' },
      'Creativity & Innovation': { name: 'The Visionary', emoji: '💡', tagline: 'Idea Generator', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)', description: 'Fueled by high curiosity and original ideation.' },
      'Leadership & Influence': { name: 'The Commander', emoji: '👑', tagline: 'Change Agent', gradient: 'linear-gradient(135deg, #a855f7, #8b5cf6)', description: 'Natural directive strength and motivating energy.' }
    };
    return map[top.name] || { name: 'The Explorer', emoji: '🧭', tagline: 'Pathfinder', gradient: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', description: 'Well-rounded and adaptable.' };
  }

  getCognitiveMetrics(aiScores: {[key: string]: number}) {
    return [
      { name: 'Decision Speed', emoji: '⚡', barColor: '#eab308', score: aiScores['Decision Speed'] ?? 50 },
      { name: 'Stress Tolerance', emoji: '🛡️', barColor: '#10b981', score: aiScores['Stress Tolerance'] ?? 50 },
      { name: 'Focus Depth', emoji: '🎯', barColor: '#0ea5e9', score: aiScores['Focus Depth'] ?? 50 },
      { name: 'Risk Appetite', emoji: '🎲', barColor: '#f97316', score: aiScores['Risk Appetite'] ?? 50 }
    ];
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  logout() {
    localStorage.setItem('loginStatus', 'false');
    localStorage.removeItem('id');
    this.router.navigate(['/signup']);
  }

  startTest() {
    this.router.navigate(['/home/testpage']);
  }
}

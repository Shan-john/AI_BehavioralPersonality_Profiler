import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './report.html',
})
export class Report implements OnInit {
  report: string = '';
  email: string = '';
  id: string = '';
  
  hasReport: boolean = false;
  isLoading: boolean = true;
  
  parsedReport = {
    coreEssence: '',
    behavioralMasterclass: '',
    powerPivot: ''
  };
  
  behavioralTraits: any[] = [];
  archetype = {
    name: '',
    emoji: '',
    tagline: '',
    gradient: '',
    description: ''
  };
  
  cognitiveMetrics: any[] = [];
  overallScore: number = 0;

  private reportApiUrl = `${environment.apiUrl}/report`;

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';

    this.email = decodeURIComponent(
      this.route.snapshot.paramMap.get('email') || ''
    );

    // Fetch report by userId from the Report API
    const userId = parseInt(this.id, 10);
    if (userId > 0) {
      this.http.get(`${this.reportApiUrl}/user/${userId}`).subscribe({
        next: (res: any) => {
          this.report = res.hasReport ? (res.data || '') : '';
          this.hasReport = !!this.report && this.report.trim().length > 0;

          if (this.hasReport) {
            try {
              const aiScores = this.extractAIScores(this.report);
              const cleanReport = this.report.replace(/SCORES_START[\s\S]*?SCORES_END/i, '').trim();
              this.parsedReport = this.parseReport(cleanReport);
              this.behavioralTraits = this.getBehavioralTraits(cleanReport, aiScores);
              this.archetype = this.getArchetype(this.behavioralTraits);
              this.cognitiveMetrics = this.getCognitiveMetrics(aiScores);
              this.overallScore = Math.round(this.behavioralTraits.reduce((sum: number, t: any) => sum + t.score, 0) / this.behavioralTraits.length);
            } catch (err) {
              console.error("Error parsing report:", err);
            }
          }

          this.isLoading = false;
          this.cdr.detectChanges(); // Force UI to update!
        },
        error: (err) => {
          console.error("Error fetching report:", err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  /**
   * Extract real AI-generated scores from the SCORES_START...SCORES_END block.
   * Returns a map of trait name -> score. Empty map if block not found (older reports).
   */
  extractAIScores(reportText: string): {[key: string]: number} {
    const scores: {[key: string]: number} = {};
    
    const match = reportText.match(/SCORES_START([\s\S]*?)SCORES_END/i);
    if (!match) return scores;
    
    const scoreBlock = match[1];
    const lines = scoreBlock.split('\n').filter(l => l.trim().length > 0);
    
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
    let coreEssence = '';
    let behavioralMasterclass = '';
    let powerPivot = '';

    // Robust regex parsing
    const coreMatch = reportText.match(/CORE TRAITS:([\s\S]*?)BEHAVIORAL PATTERNS:/i);
    const behaveMatch = reportText.match(/BEHAVIORAL PATTERNS:([\s\S]*?)STRENGTHS\s*(?:&|AND)\s*BLIND SPOTS:/i);
    const powerMatch = reportText.match(/STRENGTHS\s*(?:&|AND)\s*BLIND SPOTS:([\s\S]*?)$/i);

    if (coreMatch && behaveMatch && powerMatch) {
      coreEssence = coreMatch[1];
      behavioralMasterclass = behaveMatch[1];
      powerPivot = powerMatch[1];
    } else {
      // Legacy format
      const regexCore = /The Core Essence[\s\S]*?(?=Behavioral Masterclass)/i;
      const regexBehavioral = /Behavioral Masterclass[\s\S]*?(?=The Power & The Pivot)/i;
      const regexPower = /The Power & The Pivot[\s\S]*?$/i;
    
      const cMatch = reportText.match(regexCore);
      const bMatch = reportText.match(regexBehavioral);
      const pMatch = reportText.match(regexPower);
    
      if (cMatch && bMatch && pMatch) {
        coreEssence = cMatch[0].replace(/.*?The Core Essence\s*\(.*?\)?[:\-]?\s*/i, '');
        behavioralMasterclass = bMatch[0].replace(/.*?Behavioral Masterclass\s*\(.*?\)?[:\-]?\s*/i, '');
        powerPivot = pMatch[0].replace(/.*?The Power & The Pivot\s*\(.*?\)?[:\-]?\s*/i, '');
      } else {
        const paragraphs = reportText.split(/\n\n+/);
        if (paragraphs.length >= 3) {
          coreEssence = paragraphs[0];
          behavioralMasterclass = paragraphs[1];
          powerPivot = paragraphs.slice(2).join('\n\n');
        } else {
          coreEssence = reportText;
          behavioralMasterclass = '';
          powerPivot = '';
        }
      }
    }
    
    return {
      coreEssence: this.cleanText(coreEssence),
      behavioralMasterclass: this.cleanText(behavioralMasterclass),
      powerPivot: this.cleanText(powerPivot)
    };
  }

  cleanText(text: string): string {
    return text.replace(/^[:\-\s\n*]+/, '').trim();
  }

  /**
   * Build behavioral traits with REAL scores.
   * If AI scores exist (new reports), use them directly.
   * If not (older reports), fall back to keyword-frequency analysis of the actual text.
   */
  getBehavioralTraits(reportText: string, aiScores: {[key: string]: number}) {
    const lowercaseReport = reportText.toLowerCase();
    const totalWords = lowercaseReport.split(/\s+/).length;
    
    const countOccurrences = (words: string[]) => {
      let count = 0;
      words.forEach(word => {
        const regex = new RegExp('\\b' + word + '\\b', 'gi');
        count += (lowercaseReport.match(regex) || []).length;
      });
      return count;
    };
    
    const traits = [
      {
        name: 'Empathy & Collaboration',
        emoji: '🤝',
        keywords: ['empathy', 'empathic', 'understanding', 'compassion', 'compassionate', 'people', 'social', 'connect', 'connection', 'feel', 'feeling', 'relate', 'helper', 'collaborate', 'team', 'harmony', 'care', 'caring', 'warmth', 'kind', 'kindness', 'listener', 'support', 'supportive'],
        barGradient: 'linear-gradient(90deg, #ec4899, #f43f5e)',
        bgColor: '#fff1f2',
        badgeBg: '#ffe4e6',
        badgeText: '#be123c',
        iconBg: '#fff1f2',
        description: 'Ability to connect with, understand, and collaborate with others.'
      },
      {
        name: 'Resilience & Adaptability',
        emoji: '🧗',
        keywords: ['resilience', 'resilient', 'adaptability', 'adaptable', 'navigate', 'challenge', 'challenges', 'grit', 'stamina', 'flexibility', 'flexible', 'cope', 'coping', 'bounce', 'change', 'pivot', 'obstacle', 'pressure', 'persevere', 'endure', 'tough', 'persist'],
        barGradient: 'linear-gradient(90deg, #10b981, #14b8a6)',
        bgColor: '#f0fdfa',
        badgeBg: '#ccfbf1',
        badgeText: '#0f766e',
        iconBg: '#f0fdfa',
        description: 'Capacity to withstand pressure and adapt dynamically to change.'
      },
      {
        name: 'Analytical Depth',
        emoji: '🔍',
        keywords: ['analysis', 'analytical', 'think', 'thinker', 'critical', 'logic', 'logical', 'strategy', 'strategic', 'data', 'deep', 'problem', 'solve', 'solving', 'structure', 'structured', 'rational', 'reason', 'reasoning', 'methodical', 'precise', 'precision', 'examine'],
        barGradient: 'linear-gradient(90deg, #3b82f6, #6366f1)',
        bgColor: '#eef2ff',
        badgeBg: '#e0e7ff',
        badgeText: '#4338ca',
        iconBg: '#eef2ff',
        description: 'Logical reasoning, structured analysis, and problem-solving focus.'
      },
      {
        name: 'Creativity & Innovation',
        emoji: '💡',
        keywords: ['creative', 'creativity', 'imagination', 'imaginative', 'innovative', 'innovation', 'novel', 'artistic', 'ideas', 'idea', 'explore', 'exploring', 'create', 'curious', 'curiosity', 'original', 'originality', 'unconventional', 'inventive', 'vision', 'dream'],
        barGradient: 'linear-gradient(90deg, #f59e0b, #f97316)',
        bgColor: '#fffbeb',
        badgeBg: '#fef3c7',
        badgeText: '#b45309',
        iconBg: '#fffbeb',
        description: 'Originality of thought, out-of-the-box thinking, and generative drive.'
      },
      {
        name: 'Leadership & Influence',
        emoji: '👑',
        keywords: ['lead', 'leader', 'leadership', 'influence', 'guide', 'guiding', 'visionary', 'mentor', 'impact', 'power', 'powerful', 'drive', 'driven', 'motivate', 'confidence', 'confident', 'authority', 'command', 'inspire', 'inspiring', 'decisive', 'bold', 'ambitious'],
        barGradient: 'linear-gradient(90deg, #a855f7, #8b5cf6)',
        bgColor: '#faf5ff',
        badgeBg: '#f3e8ff',
        badgeText: '#7e22ce',
        iconBg: '#faf5ff',
        description: 'Natural tendency to take charge, inspire others, and achieve goals.'
      }
    ];

    return traits.map((trait) => {
      let score: number;
      
      // Use real AI score if available
      if (aiScores[trait.name] !== undefined) {
        score = aiScores[trait.name];
      } else {
        // Fallback: keyword frequency analysis (for older reports without SCORES block)
        const matches = countOccurrences(trait.keywords);
        const density = (matches / Math.max(totalWords, 1)) * 100;
        // Scale density to a 30-95 range realistically
        score = Math.min(95, Math.max(30, Math.round(density * 25 + 40)));
      }
      
      let level = 'Low';
      if (score >= 85) level = 'Outstanding';
      else if (score >= 70) level = 'Strong';
      else if (score >= 55) level = 'Moderate';
      else if (score >= 40) level = 'Developing';

      return { ...trait, score, level };
    });
  }

  getArchetype(traits: any[]) {
    const highestTrait = [...traits].sort((a: any, b: any) => b.score - a.score)[0];
    
    const archetypes: {[key: string]: any} = {
      'Empathy & Collaboration': {
        name: 'The Harmonizer', emoji: '🤝', tagline: 'Empathetic Bridge-Builder',
        gradient: 'linear-gradient(135deg, #f43f5e, #ec4899)',
        description: 'Driven by deep connection, empathy, and collaborative spirit. You naturally sense interpersonal dynamics, bringing harmony and consensus to any team or project.'
      },
      'Resilience & Adaptability': {
        name: 'The Catalyst', emoji: '🧗', tagline: 'Agile Crisis Pathfinder',
        gradient: 'linear-gradient(135deg, #14b8a6, #10b981)',
        description: 'Defined by relentless grit and high versatility. You view obstacles as raw opportunities, easily pivoting under pressure and helping others thrive amidst chaotic environments.'
      },
      'Analytical Depth': {
        name: 'The Strategist', emoji: '🔍', tagline: 'Rigorous Logical Thinker',
        gradient: 'linear-gradient(135deg, #6366f1, #3b82f6)',
        description: 'Possesses deep structured reasoning and problem-solving focus. You slice complex questions with precision, preferring rational evidence and strategic mapping over simple guesswork.'
      },
      'Creativity & Innovation': {
        name: 'The Visionary', emoji: '💡', tagline: 'Boundless Idea Generator',
        gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
        description: 'Fueled by high curiosity, novelty, and original ideation. You see patterns others miss, challenging conventional assumptions with innovative solutions.'
      },
      'Leadership & Influence': {
        name: 'The Commander', emoji: '👑', tagline: 'Inspiring Change Agent',
        gradient: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
        description: 'Exhibits natural directive strength and motivating energy. You easily command authority, inspire loyalty, and guide diverse groups toward ambitious milestones.'
      }
    };

    return archetypes[highestTrait.name] || {
      name: 'The Explorer', emoji: '🧭', tagline: 'Versatile Pathfinder',
      gradient: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
      description: 'Well-rounded and curious, balancing multiple behavioral competencies with steady performance and adaptive intelligence.'
    };
  }

  /**
   * Cognitive metrics: uses real AI scores if available, else keyword-based fallback.
   */
  getCognitiveMetrics(aiScores: {[key: string]: number}) {
    const metricDefs = [
      { name: 'Decision Speed', emoji: '⚡', barColor: '#eab308' },
      { name: 'Stress Tolerance', emoji: '🛡️', barColor: '#10b981' },
      { name: 'Focus Depth', emoji: '🎯', barColor: '#0ea5e9' },
      { name: 'Risk Appetite', emoji: '🎲', barColor: '#f97316' }
    ];

    return metricDefs.map(m => ({
      ...m,
      score: aiScores[m.name] !== undefined ? aiScores[m.name] : 50
    }));
  }

  printReport() {
    window.print();
  }
}

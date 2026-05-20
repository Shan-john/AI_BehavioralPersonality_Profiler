import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminHomepageService } from './admin-homepageService';
import { UserModel } from '../../model/userModel';
import { adminloginService } from '../adminlogin/adminloginservice';

@Component({
  selector: 'app-admin-homepage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-homepage.html',
})
export class AdminHomepage implements OnInit {
  users = signal<UserModel[]>([]);
  
  totalUsers = computed(() => this.users().length);
  
  analyzedUsersCount = computed(() => {
    return this.users().filter(u => this.hasReport(u.report)).length;
  });
  
  pendingUsersCount = computed(() => {
    return this.totalUsers() - this.analyzedUsersCount();
  });

  constructor(
    private router: Router, 
    private adminHomepageService: AdminHomepageService,
    private adminLoginService: adminloginService
  ) {}

  ngOnInit() : void {
    if (!this.adminLoginService.isLoggedIn()) {
      this.router.navigate(['/admin/adminlogin']);
      return;
    }
    
    this.adminHomepageService.getAllUsers().subscribe((res: any) => {
      const filteredUsers = res.filter(
        (user: any) => user.email !== 'admin@gmail.com'
      );
      this.users.set(filteredUsers);
    });
  }

  hasReport(report: string): boolean {
    return !!report && report !== 'null' && report !== 'undefined' && report.trim().length > 0 && report !== 'No report submitted';
  }

  getArchetype(reportText: string): {name: string, emoji: string} | null {
    if (!this.hasReport(reportText)) {
      return null;
    }
    
    // Try to extract real AI scores first
    const aiScores: {[key: string]: number} = {};
    const match = reportText.match(/SCORES_START([\s\S]*?)SCORES_END/i);
    if (match) {
      const lines = match[1].split('\n').filter(l => l.trim().length > 0);
      for (const line of lines) {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const score = parseInt(parts[1].trim().replace(/[^\d]/g, ''), 10);
          if (!isNaN(score) && score >= 0 && score <= 100) {
            aiScores[name] = score;
          }
        }
      }
    }

    const traitNames = [
      'Empathy & Collaboration',
      'Resilience & Adaptability',
      'Analytical Depth',
      'Creativity & Innovation',
      'Leadership & Influence'
    ];

    // Build scores: AI scores if available, else keyword analysis
    const lowercaseReport = reportText.toLowerCase();
    const totalWords = lowercaseReport.split(/\s+/).length;
    
    const keywordSets: {[key: string]: string[]} = {
      'Empathy & Collaboration': ['empathy', 'compassion', 'connect', 'team', 'care', 'warmth', 'support', 'collaborate'],
      'Resilience & Adaptability': ['resilience', 'adaptable', 'challenge', 'grit', 'flexible', 'pivot', 'pressure', 'persevere'],
      'Analytical Depth': ['analytical', 'logic', 'strategy', 'problem', 'solve', 'rational', 'structured', 'precise'],
      'Creativity & Innovation': ['creative', 'imagination', 'innovative', 'ideas', 'curious', 'original', 'inventive', 'vision'],
      'Leadership & Influence': ['lead', 'influence', 'mentor', 'impact', 'drive', 'confident', 'inspire', 'decisive']
    };

    let highestName = traitNames[0];
    let highestScore = 0;

    for (const name of traitNames) {
      let score: number;
      if (aiScores[name] !== undefined) {
        score = aiScores[name];
      } else {
        const words = keywordSets[name] || [];
        let count = 0;
        words.forEach(w => {
          const regex = new RegExp('\\b' + w + '\\b', 'gi');
          count += (lowercaseReport.match(regex) || []).length;
        });
        const density = (count / Math.max(totalWords, 1)) * 100;
        score = Math.min(95, Math.max(30, Math.round(density * 25 + 40)));
      }

      if (score > highestScore) {
        highestScore = score;
        highestName = name;
      }
    }
    
    const archetypes: {[key: string]: {name: string, emoji: string}} = {
      'Empathy & Collaboration': { name: 'Harmonizer', emoji: '🤝' },
      'Resilience & Adaptability': { name: 'Catalyst', emoji: '🧗' },
      'Analytical Depth': { name: 'Strategist', emoji: '🔍' },
      'Creativity & Innovation': { name: 'Visionary', emoji: '💡' },
      'Leadership & Influence': { name: 'Commander', emoji: '👑' }
    };

    return archetypes[highestName] || { name: 'Explorer', emoji: '🧭' };
  }

  openReport(report: string, email: string, id: string){
    this.router.navigate(['/admin/report', encodeURIComponent(report || 'No report submitted'), encodeURIComponent(email), encodeURIComponent(id)]);
  }

  logout() {
    localStorage.removeItem("loginStatus");
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("id");
    this.router.navigate(['/admin/adminlogin']);
  }
}

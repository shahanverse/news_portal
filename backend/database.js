import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'news.db');
const db = new sqlite3.Database(dbPath);

// Helper functions for promise-based queries
export const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export async function initDatabase() {
  // Create tables
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      bio TEXT
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS categories (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      summary TEXT,
      category_slug TEXT,
      cover_image TEXT,
      status TEXT CHECK(status IN ('draft', 'scheduled', 'in-review', 'published')) DEFAULT 'draft',
      scheduled_at TEXT,
      author_id INTEGER,
      views INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_slug) REFERENCES categories(slug),
      FOREIGN KEY (author_id) REFERENCES users(id)
    )
  `);

  // Seed data if empty
  const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    await dbRun(
      `INSERT INTO users (username, password, email, name, avatar, bio) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'admin',
        hashedPassword,
        'shahan@newsportal.com',
        'Muhammed Shahan',
        'http://localhost:5001/uploads/shahan_dp.jpg',
        'Lead editor with a passion for digital storytelling and news curation.'
      ]
    );
    console.log('Seeded default admin user');
  }

  const categoryCount = await dbGet('SELECT COUNT(*) as count FROM categories');
  if (categoryCount.count === 0) {
    const categories = [
      ['technology', 'Technology'],
      ['science', 'Science'],
      ['business', 'Business'],
      ['politics', 'Politics'],
      ['entertainment', 'Entertainment'],
      ['sports', 'Sports']
    ];
    for (const [slug, name] of categories) {
      await dbRun('INSERT INTO categories (slug, name) VALUES (?, ?)', [slug, name]);
    }
    console.log('Seeded categories');
  }

  const articleCount = await dbGet('SELECT COUNT(*) as count FROM articles');
  if (articleCount.count === 0) {
    const adminUser = await dbGet('SELECT id FROM users LIMIT 1');
    const authorId = adminUser.id;

    const mockArticles = [
      {
        title: 'The Rise of Quantum Computing in 2026: What It Means for Encryption',
        slug: 'rise-of-quantum-computing-2026',
        summary: 'As quantum computers reach record qubits, cybersecurity experts warn that traditional encryption standards are approaching their breaking point.',
        content: `Quantum computing has moved from theoretical physics labs to practical engineering realities. In 2026, we are witnessing a paradigm shift. Tech giants and research laboratories are reporting stable systems exceeding 1,000 logical qubits, enabling calculations that would take classical supercomputers millennia to complete.

But this power comes with a major security caveat. Public-key cryptography (like RSA and ECC) relies on mathematical problems that classical computers find hard to solve, but quantum algorithms can solve in seconds. 

### The Post-Quantum Security Race
Cybersecurity organizations worldwide are urging companies to transition to Post-Quantum Cryptography (PQC) immediately. The National Institute of Standards and Technology (NIST) has already approved a suite of quantum-resistant algorithms.

Here are the key fields being transformed:
1. **Financial Systems**: Banking transactions require urgent PQC integration.
2. **National Security**: Governments are securing high-priority communications retrospectively.
3. **Smart Infrastructure**: Connected cars and electrical grids need long-term security definitions.

While full cryptographic compromise might still be a few years away, bad actors are harvesting encrypted data today, waiting to decrypt it once quantum systems are widely available. Transitioning is no longer optional.`,
        category_slug: 'technology',
        cover_image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
        status: 'published',
        scheduled_at: null,
        views: 1450
      },
      {
        title: 'Deep Space Telescope Captures Atmosphere of Earth-Like Exoplanet',
        slug: 'deep-space-telescope-exoplanet-atmosphere',
        summary: 'Astronomers detect water vapor and carbon dioxide on a super-Earth located 40 light-years away, a massive leap in the search for habitable worlds.',
        content: `In a groundbreaking discovery, the Advanced Space Observatory (ASO) has successfully detected the atmospheric composition of GJ 1214 b, a rocky exoplanet orbiting within the habitable zone of a red dwarf star.

Using high-resolution transmission spectroscopy, scientists analyzed light passing through the planet's atmosphere, revealing clear signatures of water vapor, carbon dioxide, and methane.

### Is Life Possible?
GJ 1214 b is roughly 1.5 times the size of Earth. While its temperature range could allow liquid water to exist under high atmospheric pressure, the radiation from its host red dwarf remains a significant hurdle.

"This is the first time we've had a detailed look at the chemical recipe of a habitable-zone super-Earth," says Dr. Marcus Thorne, lead astrophysicist. "It represents a monumental step toward finding bio-signatures on other planets."`,
        category_slug: 'science',
        cover_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        status: 'published',
        scheduled_at: null,
        views: 980
      },
      {
        title: 'Global Inflation Stabilizes as Supply Chains Optimize',
        slug: 'global-inflation-stabilizes-supply-chains',
        summary: 'Major central banks report steady interest rates as commodity prices return to pre-crisis levels after years of volatility.',
        content: `Central bankers and financial institutions across the globe are breathing a collective sigh of relief. The International Monetary Fund (IMF) reported today that global inflation has stabilized at a healthy 2.2%, a marked improvement from the volatile swings of the past few years.

This stabilization is largely credited to the complete restructuring of global logistics. Near-shoring and automation have mitigated the shipping vulnerabilities that plagued the early 2020s.

### Interest Rates Outlook
With inflation under control, major central banks have hinted at gradual rate cuts to foster capital investments.
- **Federal Reserve**: Anticipated 25bps cut next quarter.
- **European Central Bank**: Maintaining a neutral stance.
- **Bank of Japan**: Transitioning away from negative interest policies completely.

Markets reacted positively to the news, with major stock indices reaching record highs. However, economists warn that political instability could still disrupt this fragile stability.`,
        category_slug: 'business',
        cover_image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800',
        status: 'published',
        scheduled_at: null,
        views: 620
      },
      {
        title: 'Renewable Energy Initiative Gains Multilateral Support at Summit',
        slug: 'renewable-energy-multilateral-support-summit',
        summary: 'Over 120 nations sign a pact to triple renewable energy capacity by 2030, pledging billions in green grid infrastructure.',
        content: `At the global Climate & Energy Accord held in Geneva, delegates from 120+ nations finalized a historic pact to accelerate transition policies. The agreement sets a binding target to triple wind, solar, and geothermal power generation capacity globally before 2030.

The pledge is supported by a $300 billion multilateral green finance fund, aiming to subsidize grid modernizations in developing economies.

### Key Targets:
- **Solar Expansion**: Tripling global installation rates.
- **Grid Storage**: Investing heavily in lithium-alternative batteries.
- **Subsidy Reform**: Phasing out fossil-fuel subsidies by 2028.

"We are moving from rhetoric to action," said the UN Energy Commissioner. "This pact provides both the regulatory roadmap and the financial capital to meet our targets."`,
        category_slug: 'politics',
        cover_image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
        status: 'published',
        scheduled_at: null,
        views: 890
      },
      {
        title: 'Indie Film Sweeps Awards at International Cinema Festival',
        slug: 'indie-film-sweeps-awards-cinema-festival',
        summary: 'A low-budget drama filmed entirely on smartphones wins Best Picture and Best Director, disrupting traditional studio expectations.',
        content: `The closing ceremony of this year's International Cinema Festival was full of surprises. 'Echoes in the Wind', a micro-budget drama directed by first-time filmmaker Ava Thorne, took home the coveted Golden Palm award along with Best Director and Best Screenplay.

Filmed entirely on high-end consumer smartphones using natural light, the film has sparked a debate on the democratization of high-quality cinema.

### A New Era for Filmmakers
The success of 'Echoes in the Wind' challenges the idea that massive production budgets are required to tell compelling stories.
"We wanted the lens to feel intimate, raw, and immediate," Thorne explained in her acceptance speech. "The technology now allows anyone to turn their vision into a cinematic reality."

Distribution rights have already been acquired by a major streaming service in a record-breaking deal.`,
        category_slug: 'entertainment',
        cover_image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
        status: 'published',
        scheduled_at: null,
        views: 1120
      },
      {
        title: 'Historic Title Win for Underdog Football Team',
        slug: 'historic-title-win-underdog-football',
        summary: 'Against all odds, the newly promoted club clinches the championship league trophy with a dramatic 93rd-minute winner.',
        content: `In what sports journalists are already calling the greatest underdog story in modern football, Albion FC has won the National League Championship.

Entering the final match of the season needing a win to secure the title, Albion was locked in a 2-2 draw with defending champions City United. In the 93rd minute, a brilliant counterattack culminated in a curling strike from 19-year-old academy graduate Leo Vance, sending the stadium into absolute delirium.

### The Journey to Victory
Just two years ago, Albion FC was playing in the second division, struggling with debt. A new tactical philosophy focusing on youth development and pressing defense turned their fortunes around.

"No one gave us a chance," said manager Thomas Cole. "But these players had belief. This trophy is for the community that supported us through our darkest times."`,
        category_slug: 'sports',
        cover_image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
        status: 'published',
        scheduled_at: null,
        views: 2100
      }
    ];

    for (const art of mockArticles) {
      await dbRun(
        `INSERT INTO articles (title, slug, content, summary, category_slug, cover_image, status, scheduled_at, author_id, views)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          art.title,
          art.slug,
          art.content,
          art.summary,
          art.category_slug,
          art.cover_image,
          art.status,
          art.scheduled_at,
          authorId,
          art.views
        ]
      );
    }
    console.log('Seeded mock articles');
  }
}

export default db;

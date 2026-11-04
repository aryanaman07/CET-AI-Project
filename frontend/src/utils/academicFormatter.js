/**
 * IITP CET AI — Academic Text Formatter & Parser (utils/academicFormatter.js)
 * -------------------------------------------------------------------------
 * Converts raw, fragmented PDF text extraction into structured, publication-quality
 * visual components in the DocumentPanel reader.
 *
 * Why Is This Needed?
 *   PDF documents store characters by 2D coordinates rather than fluid paragraphs.
 *   Direct text extraction results in:
 *     - Sentences awkwardly split across multiple lines.
 *     - Corrupted smart quotes and hyphens (e.g., "70?s" or "0 ? 9").
 *     - Symbol fonts (Wingdings) converted into random characters ('y', 'v', '§').
 *
 * Two-Stage Processing:
 *   Stage 1: cleanRawAcademicText() normalizes unicode and stitches broken sentences.
 *   Stage 2: parseAcademicBlocks() classifies text into semantic blocks:
 *            • title: Document or slide deck header.
 *            • section_header: Topic or unit headings.
 *            • bullet_list: Consolidated bullet lists.
 *            • feature_grid: Core properties/pillars rendered as visual cards.
 *            • code_block: Monospaced algorithms or programming snippets.
 *            • definition: Key terms and academic definitions.
 *            • paragraph: Standard body prose.
 */

export function cleanRawAcademicText(rawText) {
  if (!rawText) return '';

  let text = String(rawText);

  // 1. Normalize unicode spaces & smart quotes
  text = text.replace(/[\u2002\u2003\u00a0]/g, ' ');
  text = text.replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"');

  // 2. Fix broken question-mark apostrophes (e.g., 70?s -> 70's, it?s -> it's, 0 ? 9 -> 0 – 9)
  text = text.replace(/\b(\d{2,4})\?s\b/g, "$1's");
  text = text.replace(/\b([a-zA-Z]+)\?([sStTdDmMrRvVeE])\b/g, "$1'$2");
  text = text.replace(/(\b\d+)\s*\?\s*(\d+\b)/g, '$1 – $2');

  // 3. Fix symbol font bullet glyphs (Wingdings/Symbol font mapped to 'y', 'v', '§', '·')
  text = text.replace(/(?:^|\n)[ \t]*[yv§·\u2022\uf0b7\uf0a7][ \t]*\n[ \t]*/g, '\n• ');
  text = text.replace(/(?:^|\n)[ \t]*[yv§·\u2022\uf0b7\uf0a7][ \t]+/g, '\n• ');
  text = text.replace(/(\n•\s*)+/g, '\n• ');

  // 4. Unwrap single-line wraps where sentences were cut mid-stream
  const rawLines = text.split('\n');
  const stitched = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) {
      stitched.push('');
      continue;
    }

    const prev = stitched.length > 0 ? stitched[stitched.length - 1] : '';

    // Check if previous line ended without terminal punctuation
    const isPrevTerminated = prev && /[.:;!?•-]/.test(prev.slice(-1)) && !prev.endsWith('etc.');
    const isCurrentSpecial = /^([•-]|\d+\.|\d+\)|\d+\.\d+|Fig\.|Chapter)/i.test(line);
    const isCurrentHeading = line.endsWith(':') || (line.length < 25 && /^[A-Z\s]{4,}$/.test(line));

    // Stitched if continuation of sentence or bullet
    if (prev && !isPrevTerminated && !isCurrentSpecial && !isCurrentHeading) {
      stitched[stitched.length - 1] = `${prev} ${line}`;
    } else {
      stitched.push(line);
    }
  }

  return stitched.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Parses cleaned academic text into semantic visual blocks
 */
export function parseAcademicBlocks(text) {
  const cleaned = cleanRawAcademicText(text);
  if (!cleaned) return [];

  const rawLines = cleaned.split('\n');
  const blocks = [];
  let currentBullets = [];

  const flushBullets = () => {
    if (currentBullets.length > 0) {
      blocks.push({
        type: 'bullet_list',
        items: [...currentBullets]
      });
      currentBullets = [];
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) {
      // Don't flush bullets on a single blank line between bullet items
      continue;
    }

    // Check 1: Bullet list item
    if (line.startsWith('• ') || line.startsWith('- ')) {
      currentBullets.push(line.replace(/^[•-]\s*/, ''));
      continue;
    }

    // Not a bullet, flush any accumulated bullets
    flushBullets();

    // Check 2: Chapter or Primary Heading (e.g., "Chapter 1", "1) C-PROGRAMMING", "1.1) Basics of c-programming")
    if (/^(Chapter\s+\d+|[0-9]+[.)]\s+[A-Z\s-]+|[0-9]+\.[0-9]+[.)]\s+.+)/i.test(line)) {
      blocks.push({
        type: 'heading',
        text: line
      });
      continue;
    }

    // Check 3: Lead Section Heading (e.g., "Introduction:", "C-character set:")
    if (line.endsWith(':') && line.length <= 50) {
      blocks.push({
        type: 'lead_title',
        text: line.replace(/:$/, '')
      });
      continue;
    }

    // Check 4: Figure or Diagram Caption (e.g., "Fig. 1.1 Features of C", "Fig. 1.2")
    if (/^Fig\.\s*\d+(\.\d+)?/i.test(line) || /^Figure\s+\d+/i.test(line)) {
      blocks.push({
        type: 'figure',
        text: line
      });
      continue;
    }

    // Check 5: Dense Symbol/Code Set
    const specialCharMatches = line.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/g);
    if (specialCharMatches && specialCharMatches.length >= 8 && line.length < 160) {
      blocks.push({
        type: 'code_symbols',
        text: line
      });
      continue;
    }

    // Check 6: Features & Key Concept Pills (Generalized subject-neutral heuristics + C-programming support)
    const featureHeaderMatch = line.match(/^(?:Key\s+)?(?:Features|Characteristics|Properties|Pillars|Attributes|Aspects)(?:\s+of\s+[A-Za-z0-9_\s-]{1,40}?)?(?:\s*[:-]\s*|\s{2,}|\t)/i);
    const hasLegacyCFeatures = line.includes('Portability') || line.includes('Platform dependent') || line.includes('Features of C') || line.includes('Case sensitive');
    
    if (featureHeaderMatch || hasLegacyCFeatures) {
      let gridTitle = 'Key Architectural Features';
      let rest = line;

      if (featureHeaderMatch) {
        gridTitle = featureHeaderMatch[0].replace(/[:\s-]+$/, '').trim();
        rest = line.slice(featureHeaderMatch[0].length).replace(/^[:\s-]+/, '').trim();
      } else {
        rest = line.replace(/Features of C/gi, '').trim();
      }

      const words = rest
        .split(/\s{2,}|\t|[|•]\s*|\s+(?=[A-Z][a-z]+)/)
        .map(w => w.trim())
        .filter(w => w.length > 2 && w.length < 35 && !/[.!?]$/.test(w));

      if (words.length >= 3) {
        blocks.push({
          type: 'feature_grid',
          title: gridTitle.length > 3 ? gridTitle : 'Key Concepts & Features',
          items: words
        });
        continue;
      }
    }

    // Check 7: Default Paragraph
    blocks.push({
      type: 'paragraph',
      text: line
    });
  }

  flushBullets();
  return blocks;
}

import path from "path";
import fs from "fs";

export const initDocs = (configPath: string) => {

    const skaldDir = path.join(configPath, '.skald');
    const outlineYmlPath = path.join(skaldDir, 'outline.yml');

    // Create .skald directory if it doesn't exist
    if (!fs.existsSync(skaldDir)) {
      fs.mkdirSync(skaldDir, { recursive: true });
      console.log(`📁 Created directory: ${skaldDir}`);
    }

    // Check if outline.yml already exists
    if (fs.existsSync(outlineYmlPath)) {
      console.log(`⚠️  outline.yml already exists at: ${outlineYmlPath}`);
      console.log('Skipping creation to avoid overwriting existing file.');
      return;
    }

    // Create example outline.yml
    const exampleOutline = `# auto-generated example file
api:
  _docs:
    - name: authentication.md
      title: Authentication
      description: API authentication guide
  reference:
    _docs:
      - name: user.md
        title: User API
        description: User endpoints
      - name: organization.md
        title: Organization API
        description: Organization endpoints

features:
  _docs:
    - name: features.md
      title: Features Overview
      description: Overview of all features
  feat1:
    _docs:
      - name: feat1-overview.md
        title: Feature 1 Overview
        description: Detailed overview of feature 1
`;

    fs.writeFileSync(outlineYmlPath, exampleOutline);
    console.log(`✅ Created example outline.yml at: ${outlineYmlPath}`);
    console.log('📝 Edit this file to customize your documentation structure.');
}
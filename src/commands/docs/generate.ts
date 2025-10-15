import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import { Skald } from "@skald-labs/skald-node";
import { initDocs } from "./init";


const DOC_GENERATION_PROMPT = `
Based on the provided title and description, search the knowledge base for relevant information and produce a markdown file with documentation covering the provided information. Be concise and professional, but not formal.
 `;

interface DocFile {
  name: string;
  title: string;
  description?: string;
  outputPath: string;
}

function extractDocFiles(outline: any, basePath: string = '', outputBasePath: string = ''): DocFile[] {
  const docFiles: DocFile[] = [];
  
  function traverse(obj: any, currentPath: string, outputPath: string) {
    if (obj._docs && Array.isArray(obj._docs)) {
      // This is a directory with _docs
      obj._docs.forEach((doc: any) => {
        const fullOutputPath = path.join(outputPath, doc.name);
        docFiles.push({
          name: doc.name,
          title: doc.title,
          description: doc.description,
          outputPath: fullOutputPath
        });
      });
    }
    
    // Traverse other properties (subdirectories)
    Object.keys(obj).forEach(key => {
      if (key !== '_docs' && typeof obj[key] === 'object') {
        const newPath = currentPath ? path.join(currentPath, key) : key;
        const newOutputPath = outputPath ? path.join(outputPath, key) : key;
        traverse(obj[key], newPath, newOutputPath);
      }
    });
  }
  
  traverse(outline, '', outputBasePath);
  return docFiles;
}

export const generateDocs = async (skald: Skald, configPath: string, outputPath: string) => {
    const skaldDir = path.join(configPath, '.skald');
    const outlineYmlPath = path.join(skaldDir, 'outline.yml');

    // Check for required outline.yml file
    if (!fs.existsSync(outlineYmlPath)) {
      console.log("Initializing skald docs outline at .skald/outline.yml. Update the file according to your needs to start generating docs.");
      initDocs(configPath);
      return;
    }

    // Parse the outline YAML
    let outline: any;
    try {
      const outlineContent = fs.readFileSync(outlineYmlPath, 'utf-8');
      outline = yaml.load(outlineContent);
      console.log('📋 Parsed outline structure');
    } catch (error) {
      console.error('❌ Error parsing outline.yml:', error);
      process.exit(1);
    }

    console.log('📚 Generating documentation...');
    console.log(`Config path: ${configPath}`);
    console.log(`Output path: ${outputPath}`);
    console.log(`Outline file: ${outlineYmlPath}`);

    // Extract all documentation files from the outline
    const docFiles = extractDocFiles(outline, '', outputPath);
    console.log(`📄 Found ${docFiles.length} documentation files to generate`);

    // Process files in batches of 10
    const batchSize = 10;
    for (let i = 0; i < docFiles.length; i += batchSize) {
      const batch = docFiles.slice(i, i + batchSize);
      console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(docFiles.length / batchSize)} (${batch.length} files)`);
      
      await Promise.all(batch.map(async (docFile) => {
        try {
          const prompt = `${DOC_GENERATION_PROMPT}\n\nTitle: ${docFile.title}\nDescription: ${docFile.description || 'No description provided'}`;
          
          const result = await skald.chat({
            query: prompt
          });

          // Create output directory if it doesn't exist
          const outputDir = path.dirname(docFile.outputPath);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          // Write the generated content to file
          fs.writeFileSync(docFile.outputPath, result.response);
          console.log(`✅ Generated: ${docFile.outputPath}`);
        } catch (error) {
          console.error(`❌ Error generating ${docFile.outputPath}:`, error);
        }
      }));
    }

    console.log('✅ Documentation generated successfully!');
    
}
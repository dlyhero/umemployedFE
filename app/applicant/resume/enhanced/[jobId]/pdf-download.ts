// PDF Download utility for enhanced resume
export const downloadResumeAsPDF = async (enhancedResume: any, jobTitle?: string) => {
  const html2canvas = (await import('html2canvas')).default;
  const jsPDF = (await import('jspdf')).default;

  // Create a completely isolated iframe to avoid any CSS inheritance
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '800px';
  iframe.style.height = '1000px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);
  
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) throw new Error('Could not access iframe document');
  
      // Create completely clean HTML with inline styles only
      const cleanHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 16px; 
              line-height: 1.6; 
              color: #000000; 
              background-color: #ffffff; 
              padding: 30px; 
            }
            .resume-container { 
              max-width: 800px; 
              margin: 0 auto; 
              background-color: #ffffff; 
              padding: 40px; 
            }
            .header { 
              border-bottom: 3px solid #000000; 
              padding-bottom: 25px; 
              margin-bottom: 30px; 
            }
            .name { 
              font-size: 36px; 
              font-weight: bold; 
              color: #000000; 
              margin-bottom: 15px; 
            }
            .contact { 
              color: #333333; 
              font-size: 16px; 
              line-height: 1.8;
            }
            .section { 
              margin-bottom: 35px; 
              page-break-inside: avoid;
            }
            .section-title { 
              font-size: 22px; 
              font-weight: bold; 
              color: #000000; 
              border-bottom: 2px solid #cccccc; 
              padding-bottom: 8px; 
              margin-bottom: 20px; 
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .experience-item, .education-item, .project-item, .cert-item, .lang-item, .award-item, .pub-item, .volunteer-item { 
              margin-bottom: 20px; 
              padding-left: 20px; 
              border-left: 4px solid #007acc; 
              padding-top: 5px;
              padding-bottom: 5px;
            }
            .item-title { 
              font-weight: bold; 
              color: #000000; 
              font-size: 18px; 
              margin-bottom: 5px;
            }
            .item-subtitle { 
              color: #333333; 
              font-size: 16px; 
              margin-bottom: 8px; 
              font-weight: 600;
            }
            .item-description { 
              color: #555555; 
              font-size: 15px; 
              line-height: 1.6; 
              margin-top: 8px; 
            }
            .skills-container { 
              display: flex; 
              flex-wrap: wrap; 
              gap: 10px; 
              margin-top: 10px;
            }
            .skill-tag { 
              background-color: #f0f0f0; 
              color: #000000; 
              padding: 6px 12px; 
              border-radius: 6px; 
              font-size: 14px; 
              border: 1px solid #cccccc; 
              font-weight: 500;
            }
            .summary { 
              color: #333333; 
              font-size: 16px; 
              line-height: 1.7; 
              margin-bottom: 25px; 
            }
            .date-range { 
              color: #666666; 
              font-size: 14px; 
              font-style: italic; 
              margin-top: 5px;
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              padding-top: 25px; 
              border-top: 2px solid #cccccc; 
              color: #666666; 
              font-size: 14px; 
            }
            .page-break { 
              page-break-before: always; 
            }
            .contact-item {
              display: inline-block;
              margin-right: 20px;
              margin-bottom: 5px;
            }
            .tech-stack {
              margin-top: 8px;
            }
            .tech-tag {
              background-color: #e8f4fd;
              color: #0066cc;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              margin-right: 6px;
              margin-bottom: 4px;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="resume-container">
            <div class="header">
              <div class="name">${enhancedResume.full_name}</div>
              <div class="contact">
                ${enhancedResume.email ? `<span class="contact-item">${enhancedResume.email}</span>` : ''}
                ${enhancedResume.phone ? `<span class="contact-item">${enhancedResume.phone}</span>` : ''}
                ${enhancedResume.location ? `<span class="contact-item">${enhancedResume.location}</span>` : ''}
              </div>
            </div>
            
            ${enhancedResume.summary ? `
              <div class="section">
                <div class="section-title">Professional Summary</div>
                <div class="summary">${enhancedResume.summary}</div>
              </div>
            ` : ''}
            
            ${enhancedResume.experience && enhancedResume.experience.length > 0 ? `
              <div class="section">
                <div class="section-title">Professional Experience</div>
                ${enhancedResume.experience.map((exp: any) => `
                  <div class="experience-item">
                    <div class="item-title">${exp.position}</div>
                    <div class="item-subtitle">${exp.company}${exp.location ? ` • ${exp.location}` : ''}</div>
                    <div class="date-range">${exp.start_date} - ${exp.end_date}</div>
                    <div class="item-description">${exp.description}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${enhancedResume.skills ? `
              <div class="section">
                <div class="section-title">Skills</div>
                ${enhancedResume.skills.technical && enhancedResume.skills.technical.length > 0 ? `
                  <div style="margin-bottom: 15px;">
                    <h4 style="font-size: 16px; font-weight: bold; color: #000000; margin-bottom: 8px;">Technical Skills</h4>
                    <div class="skills-container">
                      ${enhancedResume.skills.technical.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                  </div>
                ` : ''}
                ${enhancedResume.skills.soft_skills && enhancedResume.skills.soft_skills.length > 0 ? `
                  <div style="margin-bottom: 15px;">
                    <h4 style="font-size: 16px; font-weight: bold; color: #000000; margin-bottom: 8px;">Soft Skills</h4>
                    <div class="skills-container">
                      ${enhancedResume.skills.soft_skills.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                  </div>
                ` : ''}
                ${enhancedResume.skills.tools && enhancedResume.skills.tools.length > 0 ? `
                  <div style="margin-bottom: 15px;">
                    <h4 style="font-size: 16px; font-weight: bold; color: #000000; margin-bottom: 8px;">Tools & Technologies</h4>
                    <div class="skills-container">
                      ${enhancedResume.skills.tools.map((tool: string) => `<span class="skill-tag">${tool}</span>`).join('')}
                    </div>
                  </div>
                ` : ''}
                ${Array.isArray(enhancedResume.skills) && enhancedResume.skills.length > 0 ? `
                  <div class="skills-container">
                    ${enhancedResume.skills.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            ` : ''}
            
            ${enhancedResume.education && enhancedResume.education.length > 0 ? `
              <div class="section">
                <div class="section-title">Education</div>
                ${enhancedResume.education.map((edu: any) => `
                  <div class="education-item">
                    <div class="item-title">${edu.degree}${edu.field_of_study ? ` in ${edu.field_of_study}` : ''}</div>
                    <div class="item-subtitle">${edu.institution}${edu.location ? ` • ${edu.location}` : ''}</div>
                    <div class="date-range">${edu.graduation_year}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${enhancedResume.projects && enhancedResume.projects.length > 0 ? `
              <div class="section">
                <div class="section-title">Projects</div>
                ${enhancedResume.projects.map((project: any) => `
                  <div class="project-item">
                    <div class="item-title">${project.name}</div>
                    ${project.technologies && project.technologies.length > 0 ? `
                      <div class="tech-stack">
                        ${project.technologies.map((tech: string) => `<span class="tech-tag">${tech}</span>`).join('')}
                      </div>
                    ` : ''}
                    <div class="item-description">${project.description}</div>
                    ${project.url ? `<div class="date-range">${project.url}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${enhancedResume.certifications && enhancedResume.certifications.length > 0 ? `
              <div class="section">
                <div class="section-title">Certifications</div>
                ${enhancedResume.certifications.map((cert: any) => `
                  <div class="cert-item">
                    <div class="item-title">${cert.name}</div>
                    <div class="item-subtitle">${cert.issuer}</div>
                    <div class="date-range">${cert.issue_date || cert.date || 'No date'}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${enhancedResume.languages && enhancedResume.languages.length > 0 ? `
              <div class="section">
                <div class="section-title">Languages</div>
                ${enhancedResume.languages.map((lang: any) => `
                  <div class="lang-item">
                    <div class="item-title">${lang.name}</div>
                    <div class="item-subtitle">${lang.proficiency}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${enhancedResume.awards && enhancedResume.awards.length > 0 ? `
              <div class="section">
                <div class="section-title">Awards & Recognition</div>
                ${enhancedResume.awards.map((award: any) => `
                  <div class="award-item">
                    <div class="item-title">${award.title}</div>
                    <div class="item-subtitle">${award.issuer}</div>
                    <div class="item-description">${award.description || ''}</div>
                    <div class="date-range">${award.date || 'No date'}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${enhancedResume.publications && enhancedResume.publications.length > 0 ? `
              <div class="section">
                <div class="section-title">Publications</div>
                ${enhancedResume.publications.map((pub: any) => `
                  <div class="pub-item">
                    <div class="item-title">${pub.title}</div>
                    <div class="item-subtitle">${pub.publisher}</div>
                    <div class="item-description">Authors: ${pub.authors?.join(', ') || 'N/A'}</div>
                    <div class="date-range">${pub.publication_date || 'No date'}${pub.url ? ` • ${pub.url}` : ''}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${enhancedResume.volunteer_experience && enhancedResume.volunteer_experience.length > 0 ? `
              <div class="section">
                <div class="section-title">Volunteer Experience</div>
                ${enhancedResume.volunteer_experience.map((volunteer: any) => `
                  <div class="volunteer-item">
                    <div class="item-title">${volunteer.role}</div>
                    <div class="item-subtitle">${volunteer.organization}</div>
                    <div class="date-range">${volunteer.start_date} - ${volunteer.end_date}</div>
                    <div class="item-description">${volunteer.description}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            <div class="footer">
              Enhanced resume generated on ${new Date(enhancedResume.created_at).toLocaleDateString()}
            </div>
          </div>
        </body>
        </html>
      `;
  
  iframeDoc.open();
  iframeDoc.write(cleanHTML);
  iframeDoc.close();
  
  // Wait for iframe to load
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Clean up iframe
  document.body.removeChild(iframe);

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  // Create a new iframe with proper height calculation
  const finalIframe = document.createElement('iframe');
  finalIframe.style.position = 'absolute';
  finalIframe.style.left = '-9999px';
  finalIframe.style.top = '0';
  finalIframe.style.width = '800px';
  finalIframe.style.height = 'auto'; // Let it size naturally
  finalIframe.style.border = 'none';
  document.body.appendChild(finalIframe);
  
  const finalIframeDoc = finalIframe.contentDocument || finalIframe.contentWindow?.document;
  if (!finalIframeDoc) throw new Error('Could not access final iframe document');
  
  // Write the HTML content
  finalIframeDoc.open();
  finalIframeDoc.write(cleanHTML);
  finalIframeDoc.close();
  
  // Wait for iframe to load and get natural height
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const naturalHeight = finalIframeDoc.body.scrollHeight;
  const naturalWidth = finalIframeDoc.body.scrollWidth;
  
  // Set the iframe to the natural height
  finalIframe.style.height = `${naturalHeight}px`;
  
  // Wait a bit more for the height change to take effect
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Generate canvas with the full content
  const canvas = await html2canvas(finalIframeDoc.body, {
    scale: 1.2,
    useCORS: false,
    backgroundColor: '#ffffff',
    allowTaint: false,
    foreignObjectRendering: false,
    logging: false,
    removeContainer: true,
    width: naturalWidth,
    height: naturalHeight
  });
  
  // Clean up final iframe
  document.body.removeChild(finalIframe);
  
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  
  // Calculate dimensions
  const margin = 15; // 15mm margins
  const usableWidth = pdfWidth - (margin * 2);
  const usableHeight = pdfHeight - (margin * 2);
  
  // Calculate scale to fit width
  const scale = usableWidth / imgWidth;
  const scaledHeight = imgHeight * scale;
  
  // Calculate how many pages we need
  const pagesNeeded = Math.ceil(scaledHeight / usableHeight);
  
  // Add content to PDF pages
  for (let page = 0; page < pagesNeeded; page++) {
    if (page > 0) {
      pdf.addPage();
    }
    
    // Calculate the portion of the image to show on this page
    const startY = page * usableHeight;
    const endY = Math.min((page + 1) * usableHeight, scaledHeight);
    
    // Create a temporary canvas for this page slice
    const pageCanvas = document.createElement('canvas');
    const pageCtx = pageCanvas.getContext('2d');
    if (!pageCtx) continue;
    
    pageCanvas.width = imgWidth;
    pageCanvas.height = Math.min(usableHeight / scale, imgHeight - (startY / scale));
    
    // Draw the portion of the image for this page
    pageCtx.drawImage(
      canvas,
      0, startY / scale, // Source x, y
      imgWidth, Math.min(usableHeight / scale, imgHeight - (startY / scale)), // Source width, height
      0, 0, // Destination x, y
      imgWidth, Math.min(usableHeight / scale, imgHeight - (startY / scale)) // Destination width, height
    );
    
    // Add this page slice to the PDF
    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
    const pageImgWidth = pageCanvas.width;
    const pageImgHeight = pageCanvas.height;
    const pageScale = Math.min(usableWidth / pageImgWidth, usableHeight / pageImgHeight);
    
    const imgX = margin + (usableWidth - pageImgWidth * pageScale) / 2;
    const imgY = margin;
    
    pdf.addImage(pageImgData, 'JPEG', imgX, imgY, pageImgWidth * pageScale, pageImgHeight * pageScale);
  }
  
  pdf.save(`enhanced-resume-${jobTitle || 'job'}.pdf`);
};
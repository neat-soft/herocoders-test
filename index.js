const axios = require('axios');
const fs = require('fs');

async function getComponents() {
  try {
    const response = await axios.get('https://herocoders.atlassian.net/rest/api/3/project/SP/components');
    return response.data;
  } catch (error) {
    console.error('Error retrieving components:', error);
    throw error;
  }
}

async function getIssues() {
  try {
    const response = await axios.get('https://herocoders.atlassian.net/rest/api/3/search?jql=project=SP');
    return response.data.issues;
  } catch (error) {
    console.error('Error retrieving issues:', error);
    throw error;
  }
}

function findComponentsWithoutLead(components, issues) {
  const componentMap = new Map();
  
  // Initialize component map with component names and issue count
  for (const component of components) {
    componentMap.set(component.name, 0);
  }
  
  // Count the number of issues for each component
  for (const issue of issues) {
    const issueComponents = issue.fields.components.map(component => component.name);
    for (const component of issueComponents) {
      if (componentMap.has(component)) {
        componentMap.set(component, componentMap.get(component) + 1);
      }
    }
  }
  
  // Filter components without a lead
  const componentsWithoutLead = [];
  for (const [component, issueCount] of componentMap.entries()) {
    if (issueCount > 0) {
      componentsWithoutLead.push({ component, issueCount });
    }
  }
  
  return componentsWithoutLead;
}

async function main() {
  try {
    const components = await getComponents();
    const issues = await getIssues();
    const componentsWithoutLead = findComponentsWithoutLead(components, issues);
    
    // Print components without lead and issue count
    for (const { component, issueCount } of componentsWithoutLead) {
      console.log(`Component: ${component}, Issue Count: ${issueCount}`);
    }
    
    // Write output to a file
    const output = componentsWithoutLead.map(({ component, issueCount }) => `Component: ${component}, Issue Count: ${issueCount}`).join('\n');
    fs.writeFileSync('output.txt', output);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();
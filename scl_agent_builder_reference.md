# SCL Agent Builder Reference

> **Welcome to SCL Agents Hub!** This comprehensive guide covers everything your team needs to know about building powerful AI agents using LibreChat's Agent Builder UI.

## Table of Contents
- [Quick Start](#quick-start)
- [Basic Agent Setup](#basic-agent-setup)
- [Model Configuration](#model-configuration)
- [Agent Capabilities](#agent-capabilities)
- [Advanced Features](#advanced-features)
- [File Management](#file-management)
- [Tools & Integrations](#tools--integrations)
- [Sharing & Collaboration](#sharing--collaboration)
- [Best Practices](#best-practices)
- [Configuration Examples](#configuration-examples)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Accessing the Agent Builder
1. Select **"Agents"** from the endpoint dropdown menu
2. Open the **Agent Builder panel** in the Side Panel
3. Click **"Create New Agent"** or select an existing agent from the dropdown

### Selecting Existing Agents
- Choose from the dropdown in the Side Panel
- Or mention with **@agent-name** in the chat input

---

## Basic Agent Setup

### 1. **Avatar**
- Upload a custom image to personalize your agent
- Helps team members quickly identify different agents
- Recommended: Use clear, professional images

### 2. **Name**
- Choose a distinctive, memorable name
- Examples: `SCL-Code-Assistant`, `Project-Manager-Bot`, `Data-Analyst`
- Keep it descriptive for team collaboration

### 3. **Description**
- Optional but recommended for team usage
- Explain the agent's purpose and intended use cases
- Example: *"Specialized assistant for code reviews and debugging SCL projects"*

### 4. **Instructions**
- **Most important field** - defines your agent's behavior
- Write clear, specific instructions about:
  - Role and expertise area
  - Communication style
  - Specific tasks it should handle
  - Any constraints or guidelines

**Example Instructions:**
```
You are a senior software engineer specializing in SCL projects. 
Your role is to:
- Review code for best practices and potential issues
- Suggest improvements and optimizations
- Help debug problems
- Maintain SCL coding standards

Always provide clear explanations and actionable suggestions.
Be thorough but concise in your responses.
```

---

## Model Configuration

### **Model Selection**
- **Provider**: Choose from OpenAI, Anthropic (Claude), Google, etc.
- **Model**: Select specific model (e.g., GPT-4o, Claude Sonnet, Gemini Pro)

### **Performance Parameters**
- **Temperature** (0-1): Controls creativity/randomness
  - `0.1-0.3`: Focused, consistent responses (good for code/analysis)
  - `0.7-1.0`: Creative, varied responses (good for brainstorming)
- **Max Context Tokens**: How much conversation history to remember
- **Max Output Tokens**: Limits response length

### **Recommended Settings by Use Case**
| Use Case | Temperature | Context Tokens | Output Tokens |
|----------|-------------|----------------|---------------|
| Code Review | 0.2 | 16,000 | 2,000 |
| Documentation | 0.3 | 8,000 | 4,000 |
| Brainstorming | 0.8 | 4,000 | 2,000 |
| Data Analysis | 0.1 | 32,000 | 3,000 |

---

## Agent Capabilities

> **Note**: All capabilities can be toggled on/off based on your needs.

### 🔧 **Execute Code**
- **What it does**: Runs code in multiple programming languages
- **Languages supported**: Python, JavaScript, TypeScript, Go, C, C++, Java, PHP, Rust, Fortran
- **Use cases**: 
  - Code testing and debugging
  - Data analysis and visualization
  - Prototyping solutions
- **Requirements**: API subscription from code.librechat.ai

### 📁 **File Search**
- **What it does**: RAG (Retrieval-Augmented Generation) with document search
- **Use cases**:
  - Chat with project documentation
  - Search through codebase explanations
  - Query knowledge bases
- **Best for**: Large document collections, research, knowledge retrieval

### 🔗 **Actions**
- **What it does**: Create custom tools from OpenAPI specifications
- **Use cases**:
  - Integrate with APIs (GitHub, Jira, Slack)
  - Connect to internal SCL tools
  - Automate workflows
- **Setup**: Provide OpenAPI spec URL

### 🛠️ **Tools**
- **Built-in tools available**:
  - **Calculator**: Mathematical computations
  - **Web Search**: Real-time information lookup
  - **Weather**: Current weather data
  - **Image Generation**: DALL-E, Stable Diffusion
  - **And more**: See [Tools Section](#tools--integrations)

### 🎨 **Artifacts**
- **What it does**: Creates interactive content in separate UI
- **Generates**:
  - React components
  - HTML pages
  - Mermaid diagrams
  - SVG graphics
- **Perfect for**: Prototypes, visualizations, interactive demos

### 👁️ **OCR (File Context)**
- **What it does**: Extracts text from images and documents
- **Use cases**:
  - Process scanned documents
  - Extract text from screenshots
  - Analyze charts and diagrams
- **Note**: Uses Mistral OCR API (may incur costs)

### 🔗 **Chain**
- **What it does**: Connect multiple agents in sequence
- **Use cases**:
  - Complex multi-step workflows
  - Specialized agent collaboration
  - Pipeline processing
- **Limit**: Maximum 10 agents per chain

### 🌐 **Web Search**
- **What it does**: Real-time web information retrieval
- **Use cases**:
  - Latest technology updates
  - Current best practices
  - Real-time data lookup

---

## Advanced Features

### **Max Agent Steps**
- Controls how many actions an agent can take before responding
- **Default**: 25 steps
- **One step = one of**:
  - Single AI API request
  - One round of tool usage
  - Follow-up processing

**Example Workflow (3 steps):**
1. User asks question → AI processes
2. AI calls tool (e.g., web search) → gets results  
3. AI formulates final response with tool data

### **Agent Chaining**
- **Access**: Advanced Settings panel in Agent Builder
- **Status**: Beta feature
- **Use case**: Create specialized agent workflows
- **Example Chain**:
  1. Research Agent → gathers information
  2. Analysis Agent → processes data  
  3. Report Agent → formats final output

---

## File Management

### **Four Upload Categories**

#### 1. **Image Upload**
- For visual content processing
- Agent can analyze and describe images
- Useful for UI mockups, diagrams, screenshots

#### 2. **File Search Upload** 
- Documents become searchable knowledge base
- Agent can quote and reference specific sections
- Best for: Documentation, manuals, research papers

#### 3. **Code Interpreter Upload**
- Files for code processing and execution
- Can analyze, modify, and run code files
- Supports various programming languages

#### 4. **File Context (OCR)**
- Documents processed and text added to agent instructions
- Text becomes part of agent's permanent knowledge
- Good for: Templates, guidelines, reference materials

### **File Management Tips**
- **Organize by purpose**: Use appropriate upload category
- **File sizes**: Be mindful of token limits
- **Updates**: Re-upload if documents change
- **Security**: Sensitive data becomes part of agent memory

---

## Tools & Integrations

### **Model Context Protocol (MCP) Servers**
Advanced tool integration system for connecting external services.

**Popular MCP Servers for SCL Team:**
- **Filesystem**: Access local files and directories
- **Puppeteer**: Web automation and scraping  
- **Spotify**: Music control (example integration)
- **Custom SCL Tools**: Connect internal company tools

**Setup Process:**
1. Configure MCP servers in `librechat.yaml`
2. Restart LibreChat
3. In Agent Builder → "Add Tools" → Select MCP servers
4. Choose specific tools from each server

### **Built-in Tools**

#### **Essential for Development**
- **Calculator**: Mathematical computations
- **Web Search**: Latest information lookup
- **Google Search**: Comprehensive web search

#### **Content Creation**
- **OpenAI Image Tools**: Generate and edit images with GPT-Image-1
- **DALL-E-3**: Text-to-image generation
- **Stable Diffusion/Flux**: Advanced image generation

#### **Specialized Tools**
- **Wolfram**: Complex mathematical and computational queries
- **OpenWeather**: Weather data and forecasts
- **Tavily Search**: Advanced search with diverse data sources
- **Azure AI Search**: Enterprise search capabilities
- **Traversaal**: Robust search API for LLM agents

---

## Sharing & Collaboration

### **User-Level Sharing**
- **Share with All Users**: Make your agent available to the entire SCL team
- **Editing Permissions**: Control who can modify your shared agents
- **Private by Default**: Agents are private unless explicitly shared

### **Team Collaboration Best Practices**
1. **Naming Convention**: Use clear, descriptive names
   - `SCL-Frontend-Helper`
   - `Database-Query-Assistant`
   - `Code-Review-Bot`

2. **Documentation**: Always fill out the description field
3. **Permission Strategy**: 
   - Share widely-useful agents with the team
   - Keep experimental agents private
   - Give editing rights to relevant team members

### **Administrative Controls**
- Admins can enable/disable agent sharing
- Control agent creation permissions
- Manage platform-wide settings

---

## Best Practices

### **Writing Effective Instructions**
✅ **Do:**
- Be specific about the agent's role and expertise
- Include examples of desired behavior
- Set clear boundaries and limitations
- Use consistent terminology
- Test thoroughly before sharing

❌ **Don't:**
- Write vague, generic instructions
- Forget to specify output format preferences
- Ignore security considerations for sensitive data
- Over-complicate simple tasks

### **Example: Good vs. Bad Instructions**

**❌ Bad:**
```
You are a helpful assistant that helps with coding.
```

**✅ Good:**
```
You are a senior Python developer specializing in SCL's backend systems. 

Your responsibilities:
- Review Python code for PEP 8 compliance and best practices
- Suggest performance optimizations for database queries
- Help debug issues in our Django applications
- Recommend appropriate testing strategies

Always:
- Provide specific, actionable feedback
- Include code examples when suggesting changes
- Explain the reasoning behind your recommendations
- Consider SCL's existing architecture and coding standards

Communication style: Professional, thorough, but concise.
```

### **Capability Selection Strategy**
- **Enable only what you need**: Reduces complexity and potential issues
- **Start minimal**: Add capabilities as requirements become clear
- **Consider costs**: Some capabilities (OCR, Code Interpreter) may incur charges

### **Testing Your Agents**
1. **Test core functionality** with typical use cases
2. **Try edge cases** and unexpected inputs  
3. **Verify tool integrations** work as expected
4. **Check file upload** behavior
5. **Test sharing permissions** if collaborating

---

## Configuration Examples

### **Code Review Agent**
```yaml
Name: SCL-Code-Reviewer
Description: Specialized agent for reviewing SCL codebase and ensuring quality standards

Capabilities Enabled:
- File Search (for accessing documentation)
- Web Search (for latest best practices)
- Artifacts (for showing code examples)

Model: Claude Sonnet (good for code analysis)
Temperature: 0.2 (focused, consistent)
Max Context: 32,000 tokens
Max Output: 2,000 tokens

Files Uploaded:
- SCL Coding Standards (File Context/OCR)
- Architecture Documentation (File Search)
```

### **Data Analysis Agent**
```yaml
Name: SCL-Data-Analyst  
Description: Processes and analyzes SCL project data, creates visualizations

Capabilities Enabled:
- Execute Code (Python for data processing)
- File Search (for data documentation)
- Artifacts (for charts and visualizations)

Model: GPT-4o (good for code generation)
Temperature: 0.1 (precise calculations)
Max Context: 16,000 tokens
Max Output: 3,000 tokens

Tools Added:
- Calculator
- Web Search (for data interpretation techniques)
```

### **Project Manager Agent**
```yaml
Name: SCL-PM-Assistant
Description: Helps with project planning, tracking, and team coordination

Capabilities Enabled:
- Web Search (for project management best practices)
- Actions (integration with Jira/project tools)
- File Search (for project documentation)

Model: GPT-4o
Temperature: 0.5 (balanced creativity/precision)
Max Context: 8,000 tokens
Max Output: 2,000 tokens

Actions Configured:
- Jira API integration
- Slack notifications
- Calendar management
```

---

## Troubleshooting

### **Common Issues**

#### **Agent Not Appearing in Dropdown**
- **Cause**: Agent builder may be disabled
- **Solution**: Check `librechat.yaml` configuration:
```yaml
endpoints:
  agents:
    disableBuilder: false
```

#### **Capabilities Not Working**
- **Cause**: Capabilities disabled in configuration
- **Solution**: Verify enabled capabilities in config:
```yaml
endpoints:
  agents:
    capabilities: 
      - "execute_code"
      - "file_search" 
      - "actions"
      - "tools"
      - "artifacts"
      - "ocr"
      - "chain"
      - "web_search"
```

#### **File Upload Issues**
- **Check file size limits** in configuration
- **Verify supported MIME types**
- **Ensure proper category selection**

#### **Tool Integration Problems**
- **MCP Servers**: Restart LibreChat after configuration changes
- **API Keys**: Verify credentials for external tools
- **Permissions**: Check domain whitelisting for Actions

#### **Performance Issues**
- **Reduce Max Context Tokens** if responses are slow
- **Limit enabled capabilities** to only what's needed
- **Optimize instructions** for clarity and brevity

### **Getting Help**
1. **Check LibreChat Documentation**: https://docs.librechat.ai
2. **GitHub Issues**: Report bugs and request features
3. **Discord Community**: Real-time help and discussions
4. **Internal SCL Support**: Reach out to team leads for SCL-specific guidance

---

## Quick Reference Card

### **Agent Creation Checklist**
- [ ] Clear, descriptive name
- [ ] Detailed description for team context
- [ ] Specific, well-written instructions
- [ ] Appropriate model and parameters
- [ ] Only necessary capabilities enabled
- [ ] Relevant files uploaded (correct categories)
- [ ] Tools configured if needed
- [ ] Tested with typical use cases
- [ ] Sharing permissions set appropriately

### **Common Agent Types for SCL**
| Agent Type | Key Capabilities | Recommended Model |
|------------|------------------|-------------------|
| Code Reviewer | File Search, Web Search | Claude Sonnet |
| Data Analyst | Execute Code, Artifacts | GPT-4o |
| Documentation | File Search, Artifacts | Claude Sonnet |
| API Integration | Actions, Web Search | GPT-4o |
| Research Assistant | Web Search, File Search | Claude Sonnet |

---

## Next Steps

1. **Start Simple**: Create your first agent with basic capabilities
2. **Experiment**: Try different configurations and capabilities  
3. **Share & Collaborate**: Build agents that benefit the entire SCL team
4. **Iterate**: Improve agents based on usage and feedback
5. **Advanced Features**: Explore agent chaining and MCP integrations

Welcome to the future of AI-powered development at SCL! 🚀

---

*This reference guide is based on LibreChat's Agent Builder functionality. For the latest updates and features, refer to the [official LibreChat documentation](https://docs.librechat.ai).*
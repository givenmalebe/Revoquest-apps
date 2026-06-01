import { SlideData } from './SlideRenderer';
import { DemoData } from './DemonstrationModule';
import { WebSearchService } from '../../services/webSearchService';
import { CreativeDiagramGenerator } from './CreativeDiagramGenerator';
import { openRouterGenerateText } from '@/services/openRouterClient';

export interface PresentationData {
  id: string;
  title: string;
  topic: string;
  slides: SlideData[];
  demonstrations: DemoData[];
  totalDuration: number;
  createdAt: Date;
}

export class SlideGenerator {
  /**
   * AI-powered slide generation with comprehensive content creation
   */
  static async generatePresentation(topic: string, aiResponse?: string): Promise<PresentationData> {
    const topicLower = topic.toLowerCase();
    const slides: SlideData[] = [];
    const demonstrations: DemoData[] = [];

    try {
      console.log('🤖 Starting AI-powered presentation generation...');
      
      // Step 1: Generate comprehensive slide content using AI
      const aiGeneratedContent = await this.generateAISlideContent(topic, aiResponse);
      console.log('✅ AI content generated');
      
      // Step 2: Create AI-generated diagram
      const aiDiagram = await this.generateAIDiagram(topic, aiGeneratedContent);
      console.log('✅ AI diagram generated');
      
      // Step 3: Build slides with AI content
      await this.buildAIGeneratedSlides(slides, demonstrations, topic, aiGeneratedContent, aiDiagram, aiResponse);
      console.log('✅ AI slides built');
      
      // Step 4: AI evaluation of slides before display
      const evaluationPassed = await this.evaluateSlides(slides, topic);
      console.log('✅ AI evaluation completed:', evaluationPassed ? 'APPROVED' : 'NEEDS IMPROVEMENT');
      
      if (!evaluationPassed) {
        console.log('🔄 Regenerating slides based on AI feedback...');
        // Regenerate with improvements
        slides.length = 0; // Clear existing slides
        await this.buildAIGeneratedSlides(slides, demonstrations, topic, aiGeneratedContent, aiDiagram, aiResponse, true);
      }

      return {
        id: `presentation-${Date.now()}`,
        title: `Understanding ${topic}`,
        topic,
        slides,
        demonstrations,
        totalDuration: slides.length * 10,
        createdAt: new Date()
      };
    } catch (error) {
      console.log('Fallback to basic presentation generation');
        // Fallback to basic generation without web search
        return this.generateBasicPresentation(topic, aiResponse);
    }
  }

  /**
   * Fallback method for basic presentation generation
   */
  private static generateBasicPresentation(topic: string, aiResponse?: string): PresentationData {
    const slides: SlideData[] = [];
    const demonstrations: DemoData[] = [];
    this.addGenericSlides(slides, demonstrations, topic);
    
    return {
      id: `presentation-${Date.now()}`,
      title: `Understanding ${topic}`,
      topic,
      slides,
      demonstrations,
      totalDuration: slides.length * 10,
      createdAt: new Date()
    };
  }

  private static analyzeTopicCategory(topicLower: string): string {
    // Machine Learning & AI
    if (topicLower.includes('machine learning') || topicLower.includes('ml') || 
        topicLower.includes('artificial intelligence') || topicLower.includes('ai') ||
        topicLower.includes('neural network') || topicLower.includes('deep learning')) {
      return 'machine-learning';
    }
    
    // Biology & Life Sciences
    if (topicLower.includes('photosynthesis') || topicLower.includes('biology') ||
        topicLower.includes('cell') || topicLower.includes('dna') || topicLower.includes('evolution')) {
      return 'photosynthesis';
    }
    
    // Physics & Quantum
    if (topicLower.includes('quantum') || topicLower.includes('physics') ||
        topicLower.includes('atom') || topicLower.includes('energy') || topicLower.includes('force')) {
      return 'quantum';
    }
    
    // Programming & Computer Science
    if (topicLower.includes('programming') || topicLower.includes('coding') ||
        topicLower.includes('software') || topicLower.includes('algorithm') ||
        topicLower.includes('javascript') || topicLower.includes('python') ||
        topicLower.includes('computer science') || topicLower.includes('development')) {
      return 'programming';
    }
    
    // Business & Management
    if (topicLower.includes('business') || topicLower.includes('management') ||
        topicLower.includes('marketing') || topicLower.includes('finance') ||
        topicLower.includes('strategy') || topicLower.includes('leadership')) {
      return 'business';
    }
    
    // General Science
    if (topicLower.includes('science') || topicLower.includes('chemistry') ||
        topicLower.includes('experiment') || topicLower.includes('research') ||
        topicLower.includes('theory') || topicLower.includes('discovery')) {
      return 'science';
    }
    
    // Technology
    if (topicLower.includes('technology') || topicLower.includes('internet') ||
        topicLower.includes('computer') || topicLower.includes('digital') ||
        topicLower.includes('app') || topicLower.includes('website') ||
        topicLower.includes('cyber') || topicLower.includes('data')) {
      return 'technology';
    }
    
    // Mathematics
    if (topicLower.includes('math') || topicLower.includes('calculus') ||
        topicLower.includes('algebra') || topicLower.includes('geometry') ||
        topicLower.includes('statistics') || topicLower.includes('number') ||
        topicLower.includes('equation') || topicLower.includes('formula')) {
      return 'mathematics';
    }
    
    // History
    if (topicLower.includes('history') || topicLower.includes('historical') ||
        topicLower.includes('war') || topicLower.includes('ancient') ||
        topicLower.includes('civilization') || topicLower.includes('empire') ||
        topicLower.includes('revolution') || topicLower.includes('century')) {
      return 'history';
    }
    
    // Health & Medicine
    if (topicLower.includes('health') || topicLower.includes('medicine') ||
        topicLower.includes('medical') || topicLower.includes('disease') ||
        topicLower.includes('treatment') || topicLower.includes('doctor') ||
        topicLower.includes('nutrition') || topicLower.includes('exercise')) {
      return 'health';
    }
    
    return 'generic';
  }

  private static addMachineLearningSlides(slides: SlideData[], demos: DemoData[]): void {
    // Slide 1: Introduction
    slides.push({
      id: 'ml-intro',
      title: 'Machine Learning: Teaching Computers to Learn',
      content: `## Welcome to Machine Learning

Machine Learning is a revolutionary technology that enables computers to learn and make decisions from data, just like humans learn from experience.

**What Makes It Special:**
• Computers can improve their performance automatically
• No need to program every possible scenario
• Gets better with more data and experience
• Powers many technologies we use daily

**Why It Matters:**
Machine Learning is transforming industries, from healthcare to entertainment, making our lives easier and more efficient.`,
      type: 'intro',
      duration: 10,
      module: 'Introduction'
    });

    // Slide 2: Core Concepts
    slides.push({
      id: 'ml-concepts',
      title: 'How Machine Learning Works',
      content: `## The Learning Process

**Core Concept:**
Instead of programming specific rules, we show computers examples and let them figure out the patterns.

**The Four Steps:**
• **Data Collection**: Gather relevant information (images, text, numbers)
• **Pattern Recognition**: Algorithm finds relationships in the data
• **Model Training**: System learns from thousands of examples
• **Prediction**: Apply knowledge to make decisions on new data

**Key Principle:**
The more quality data you provide, the smarter the machine becomes at making accurate predictions.`,
      type: 'concept',
      duration: 10,
      module: 'Fundamentals'
    });

    // Slide 3: Types and Examples
    slides.push({
      id: 'ml-types',
      title: 'Types of Machine Learning',
      content: `## Three Main Approaches

**Supervised Learning**
• Learning with labeled examples (like a teacher showing correct answers)
• Example: Email spam detection, medical diagnosis
• Most common type used in business applications

**Unsupervised Learning**
• Finding hidden patterns without knowing the "right" answer
• Example: Customer grouping, market segmentation
• Great for discovering unknown insights

**Reinforcement Learning**
• Learning through trial and error with rewards/penalties
• Example: Game playing, robotics, autonomous driving
• How AI masters complex strategic games`,
      type: 'example',
      duration: 10,
      module: 'Types'
    });

    // Slide 4: Smart Diagram
    slides.push({
      id: 'ml-diagram',
      title: 'Machine Learning Process Diagram',
      content: `## Visual Understanding

This diagram shows how machine learning transforms raw data into intelligent predictions through a systematic process.

**Process Flow:**
• Raw data enters the system
• Training algorithms process the information
• Models learn patterns and relationships
• Smart predictions are generated for new situations

The beauty of machine learning lies in this automated learning cycle that continuously improves with experience.`,
      type: 'diagram',
      duration: 10,
      module: 'Process Flow',
      diagram: {
        title: 'Machine Learning Process',
        nodes: [
          { id: 'data', label: 'Raw Data', type: 'start', position: { x: 15, y: 50 } },
          { id: 'preprocess', label: 'Data Preprocessing', type: 'process', position: { x: 35, y: 30 } },
          { id: 'algorithm', label: 'ML Algorithm', type: 'process', position: { x: 50, y: 50 } },
          { id: 'training', label: 'Model Training', type: 'process', position: { x: 35, y: 70 } },
          { id: 'model', label: 'Trained Model', type: 'concept', position: { x: 65, y: 30 } },
          { id: 'prediction', label: 'Predictions', type: 'end', position: { x: 85, y: 50 } }
        ],
        connections: [
          { from: 'data', to: 'preprocess', label: 'Clean' },
          { from: 'preprocess', to: 'algorithm', label: 'Process' },
          { from: 'algorithm', to: 'training', label: 'Learn' },
          { from: 'training', to: 'model', label: 'Create' },
          { from: 'model', to: 'prediction', label: 'Predict' },
          { from: 'algorithm', to: 'model', label: 'Optimize' }
        ]
      }
    });

    // Slide 5: Conclusion
    slides.push({
      id: 'ml-conclusion',
      title: 'Machine Learning: Your Future is Here',
      content: `## Key Takeaways

**What We Learned:**
• Machine Learning teaches computers to learn from experience
• Three main types: Supervised, Unsupervised, and Reinforcement Learning
• It powers technologies we use every day (Netflix, Google, Siri)
• The process involves data, algorithms, training, and prediction

**Why It Matters:**
Machine Learning is not just technology—it's the foundation of artificial intelligence that's reshaping every industry and creating new possibilities we never imagined.

**Your Next Steps:**
• Explore ML applications in your field of interest
• Try online ML courses and tutorials
• Experiment with beginner-friendly ML tools
• Stay curious about this rapidly evolving field

The future belongs to those who understand and leverage the power of Machine Learning!`,
      type: 'summary',
      duration: 10,
      module: 'Conclusion'
    });
  }

  private static addPhotosynthesisSlides(slides: SlideData[], demos: DemoData[]): void {
    slides.push({
      id: 'photosynthesis-concept',
      title: 'What is Photosynthesis?',
      content: `## Photosynthesis: Nature's Solar Power

Photosynthesis is the process by which plants, algae, and some bacteria convert sunlight, carbon dioxide, and water into glucose (sugar) and oxygen.

**Simple Explanation:**
Plants are like living solar panels that capture sunlight and use it to make their own food from basic ingredients in the environment.

**The Basic Recipe:**
• **Ingredients**: Sunlight + Carbon Dioxide (from air) + Water (from roots)
• **Product**: Glucose (plant food) + Oxygen (released into air)
• **Location**: Primarily in leaves, specifically in chloroplasts

**Why It Matters:**
• Plants get energy to grow and survive
• Animals (including humans) get oxygen to breathe
• Foundation of almost all life on Earth`,
      type: 'concept',
      duration: 10,
      module: 'Basics'
    });

    slides.push({
      id: 'photosynthesis-equation',
      title: 'The Photosynthesis Equation',
      content: `## The Chemical Formula

**The Complete Equation:**
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

**In Simple Terms:**
6 Carbon Dioxide + 6 Water + Sunlight → 1 Glucose + 6 Oxygen

**Breaking It Down:**
• **6CO₂**: Six molecules of carbon dioxide from the air
• **6H₂O**: Six molecules of water from the soil
• **Light energy**: Captured by chlorophyll in the leaves
• **C₆H₁₂O₆**: One molecule of glucose (sugar for plant energy)
• **6O₂**: Six molecules of oxygen released into the atmosphere

**What This Means:**
For every glucose molecule a plant makes, it releases 6 oxygen molecules that we can breathe. This is why forests are called "the lungs of the Earth."`,
      type: 'concept',
      duration: 10,
      module: 'Chemistry'
    });

    slides.push({
      id: 'photosynthesis-parts',
      title: 'Plant Parts Involved in Photosynthesis',
      content: `## The Plant's Photosynthesis Factory

**Leaves - The Main Factory**
• **Chloroplasts**: Tiny green structures containing chlorophyll
• **Chlorophyll**: Green pigment that captures sunlight
• **Stomata**: Tiny pores on leaf surface for gas exchange

**Roots - The Water Suppliers**
• Absorb water and minerals from soil
• Transport water up through the stem to leaves

**Stem - The Transportation System**
• Carries water from roots to leaves
• Transports glucose from leaves to rest of plant

**How They Work Together:**
1. Roots collect water from soil
2. Stem transports water to leaves
3. Leaves capture sunlight and carbon dioxide
4. Chloroplasts combine everything to make glucose
5. Oxygen is released through stomata`,
      type: 'concept',
      duration: 10,
      module: 'Plant Anatomy'
    });

    slides.push({
      id: 'photosynthesis-example',
      title: 'Photosynthesis in Action: A Day in a Leaf',
      content: `## Following Photosynthesis Through a Day

**Morning (Sunrise):**
• Stomata open as sunlight increases
• Chlorophyll begins absorbing light energy
• Water travels up from roots through stem

**Midday (Peak Sun):**
• Maximum photosynthesis activity
• Leaves actively absorbing CO₂ from air
• Glucose production at highest rate
• Oxygen being released rapidly

**Afternoon:**
• Continued photosynthesis as long as sunlight is available
• Glucose being converted to starch for storage
• Some glucose transported to other plant parts

**Evening/Night:**
• Photosynthesis slows down and stops
• Stomata may close to prevent water loss
• Plant uses stored glucose for energy to grow and maintain itself

**Real Example:**
A large oak tree can produce enough oxygen in one day for two people to breathe, while absorbing 48 pounds of CO₂ per year.`,
      type: 'example',
      duration: 10,
      module: 'Daily Process'
    });
  }

  private static addQuantumSlides(slides: SlideData[], demos: DemoData[]): void {
    slides.push({
      id: 'quantum-basics',
      title: 'Quantum Computing Principles',
      content: `## Enter the Quantum Realm

Quantum computing harnesses quantum mechanical phenomena to process information in fundamentally new ways.

**Key Concepts:**
• Qubits: Quantum bits that can exist in superposition
• Superposition: Being in multiple states simultaneously
• Entanglement: Quantum particles connected across space
• Quantum gates: Operations that manipulate qubits

**Advantages:**
• Exponential speedup for certain problems
• Parallel processing capabilities
• Cryptography and security applications
• Complex optimization solutions`,
      type: 'concept',
      duration: 10,
      module: 'Quantum Mechanics'
    });

    demos.push({
      id: 'quantum-superposition',
      type: 'interactive',
      title: 'Quantum Superposition Demo',
      description: 'Explore how qubits exist in multiple states',
      config: {
        states: ['0', '1', 'Superposition']
      }
    });
  }

  private static addProgrammingSlides(slides: SlideData[], demos: DemoData[]): void {
    slides.push({
      id: 'programming-fundamentals',
      title: 'Programming Fundamentals',
      content: `## Building with Code

Programming is the art and science of creating instructions for computers to solve problems and automate tasks.

**Core Concepts:**
• Variables: Storage containers for data
• Functions: Reusable blocks of code
• Loops: Repeating actions efficiently
• Conditionals: Making decisions in code

**Programming Languages:**
• Python: Beginner-friendly and versatile
• JavaScript: Powers web applications
• Java: Enterprise and mobile development
• C++: System programming and performance

**Best Practices:**
• Write clean, readable code
• Comment and document your work
• Test your code thoroughly
• Follow coding standards`,
      type: 'concept',
      duration: 10,
      module: 'Fundamentals'
    });

    demos.push({
      id: 'code-execution',
      type: 'diagram',
      title: 'Code Execution Flow',
      description: 'How code flows from writing to execution',
      config: {}
    });
  }

  private static addBusinessSlides(slides: SlideData[], demos: DemoData[]): void {
    slides.push({
      id: 'business-strategy',
      title: 'Business Strategy Essentials',
      content: `## Strategic Business Thinking

Effective business strategy involves planning, analysis, and execution to achieve organizational goals.

**Key Elements:**
• Vision: Where the company wants to be
• Mission: Why the company exists
• Values: Guiding principles and beliefs
• Goals: Specific, measurable objectives

**Strategic Planning Process:**
• Market analysis and research
• Competitive landscape assessment
• SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)
• Resource allocation and budgeting

**Implementation:**
• Action plans and timelines
• Performance metrics and KPIs
• Regular review and adjustment`,
      type: 'concept',
      duration: 10,
      module: 'Strategy'
    });

    demos.push({
      id: 'business-metrics',
      type: 'chart',
      title: 'Business Performance Dashboard',
      description: 'Key performance indicators visualization',
      config: {
        labels: ['Revenue', 'Profit', 'Growth', 'Efficiency'],
        chartTitle: 'Business Metrics Overview'
      }
    });
  }

  private static addScienceSlides(slides: SlideData[], demos: DemoData[], topic: string): void {
    slides.push({
      id: 'science-concept',
      title: `What is ${topic}?`,
      content: `## Understanding ${topic}

${topic} is a scientific concept that helps us understand how the natural world works.

**Scientific Method Applied:**
• **Observation**: What we notice about ${topic}
• **Hypothesis**: Educated guesses about how ${topic} works
• **Experimentation**: Testing our ideas about ${topic}
• **Analysis**: What the results tell us about ${topic}

**Key Scientific Principles:**
• Evidence-based understanding through research and experimentation
• Peer review and validation by the scientific community
• Continuous refinement of knowledge as new discoveries are made
• Practical applications that benefit society and advance human knowledge`,
      type: 'concept',
      duration: 10,
      module: 'Scientific Foundation'
    });

    slides.push({
      id: 'science-application',
      title: `${topic} in Practice`,
      content: `## How ${topic} is Applied

**Research Applications:**
• Laboratory studies and controlled experiments
• Field research and real-world observations
• Data collection and statistical analysis
• Collaboration between scientists worldwide

**Real-World Impact:**
• Medical advances and health improvements
• Environmental protection and sustainability
• Technological innovations and discoveries
• Educational resources and public understanding

**Example Applications:**
• Practical uses in industry and manufacturing
• Solutions to everyday problems and challenges
• Advancement of human knowledge and capabilities
• Foundation for future scientific discoveries`,
      type: 'example',
      duration: 10,
      module: 'Applications'
    });
  }

  private static addTechnologySlides(slides: SlideData[], demos: DemoData[], topic: string): void {
    slides.push({
      id: 'tech-concept',
      title: `Understanding ${topic}`,
      content: `## ${topic} Explained

${topic} represents an important technological advancement that has transformed how we work, communicate, and solve problems.

**Core Technology Concepts:**
• **Innovation**: How ${topic} represents a new way of doing things
• **Efficiency**: Ways ${topic} improves speed, accuracy, or convenience
• **Connectivity**: How ${topic} connects people, systems, or information
• **Scalability**: Ability to grow and adapt to different needs

**Technical Foundation:**
• Hardware and software components involved
• Systems and networks that enable functionality
• User interfaces and interaction methods
• Security and privacy considerations`,
      type: 'concept',
      duration: 10,
      module: 'Technology Basics'
    });

    slides.push({
      id: 'tech-impact',
      title: `Impact of ${topic}`,
      content: `## How ${topic} Changes Things

**Personal Impact:**
• Daily life improvements and conveniences
• New ways to communicate and share information
• Access to services and resources previously unavailable
• Enhanced productivity and efficiency in personal tasks

**Business Impact:**
• Automation of routine tasks and processes
• New business models and revenue opportunities
• Improved customer service and satisfaction
• Global reach and market expansion possibilities

**Societal Impact:**
• Educational opportunities and knowledge sharing
• Healthcare improvements and medical advances
• Environmental benefits and sustainability solutions
• Social connections and community building`,
      type: 'example',
      duration: 10,
      module: 'Real-World Impact'
    });
  }

  private static addMathematicsSlides(slides: SlideData[], demos: DemoData[], topic: string): void {
    slides.push({
      id: 'math-concept',
      title: `${topic} Fundamentals`,
      content: `## Understanding ${topic}

${topic} is a mathematical concept that provides tools for solving problems and understanding patterns in numbers, shapes, or relationships.

**Mathematical Thinking:**
• **Logic**: Using reasoning to understand relationships and patterns
• **Problem Solving**: Breaking down complex problems into manageable steps
• **Abstraction**: Finding general principles that apply to many situations
• **Precision**: Using exact definitions and clear mathematical language

**Core Elements:**
• Definitions and terminology specific to ${topic}
• Rules and properties that govern how ${topic} works
• Methods and techniques for calculations and solutions
• Connections to other areas of mathematics`,
      type: 'concept',
      duration: 10,
      module: 'Mathematical Foundation'
    });

    slides.push({
      id: 'math-applications',
      title: `Applications of ${topic}`,
      content: `## Where ${topic} is Used

**Academic Applications:**
• Foundation for advanced mathematics courses
• Problem-solving in science and engineering
• Research in pure and applied mathematics
• Teaching and educational curriculum development

**Professional Applications:**
• Engineering design and analysis
• Financial modeling and economic analysis
• Computer science and software development
• Data analysis and statistical research

**Everyday Applications:**
• Personal finance and budgeting decisions
• Home improvement and construction projects
• Shopping and comparison calculations
• Planning and scheduling activities`,
      type: 'example',
      duration: 10,
      module: 'Practical Uses'
    });
  }

  private static addHistorySlides(slides: SlideData[], demos: DemoData[], topic: string): void {
    slides.push({
      id: 'history-context',
      title: `Historical Context of ${topic}`,
      content: `## Understanding ${topic} in History

${topic} represents an important period, event, or development in human history that has shaped our world today.

**Historical Significance:**
• **Causes**: Events and conditions that led to ${topic}
• **Key Figures**: Important people who influenced ${topic}
• **Timeline**: When ${topic} occurred and how long it lasted
• **Geographic Context**: Where ${topic} took place and its reach

**Impact on Society:**
• Political changes and government structures
• Economic effects and trade relationships
• Cultural developments and social changes
• Technological advances and innovations`,
      type: 'concept',
      duration: 10,
      module: 'Historical Background'
    });

    slides.push({
      id: 'history-legacy',
      title: `Legacy of ${topic}`,
      content: `## How ${topic} Influences Today

**Modern Connections:**
• Laws and government systems influenced by ${topic}
• Cultural traditions and practices that continue today
• Educational curricula and academic study of ${topic}
• Museums, monuments, and historical preservation

**Lessons Learned:**
• Understanding how societies change and develop
• Recognizing patterns in human behavior and decision-making
• Appreciating the complexity of historical events
• Learning from both successes and mistakes of the past

**Continued Relevance:**
• Current events that echo historical patterns
• Modern challenges with historical precedents
• Ongoing debates about historical interpretation
• Importance of preserving historical knowledge for future generations`,
      type: 'example',
      duration: 10,
      module: 'Modern Relevance'
    });
  }

  private static addHealthSlides(slides: SlideData[], demos: DemoData[], topic: string): void {
    slides.push({
      id: 'health-concept',
      title: `Understanding ${topic}`,
      content: `## ${topic} and Your Health

${topic} is an important aspect of health and wellness that affects how our bodies function and how we feel.

**Health Fundamentals:**
• **Prevention**: Steps to avoid health problems related to ${topic}
• **Symptoms**: Signs and indicators to watch for
• **Treatment**: Available options for addressing ${topic}
• **Maintenance**: Ongoing care and healthy habits

**Body Systems Involved:**
• How ${topic} affects different parts of the body
• Connections between ${topic} and overall wellness
• Risk factors and protective factors
• Individual differences and personal health considerations`,
      type: 'concept',
      duration: 10,
      module: 'Health Basics'
    });

    slides.push({
      id: 'health-practice',
      title: `Practical Health Approaches to ${topic}`,
      content: `## Managing ${topic} in Daily Life

**Lifestyle Factors:**
• Nutrition and dietary considerations related to ${topic}
• Exercise and physical activity recommendations
• Sleep and rest requirements for optimal health
• Stress management and mental health aspects

**Professional Care:**
• When to consult healthcare providers about ${topic}
• Types of medical professionals who specialize in ${topic}
• Diagnostic tests and screening procedures
• Treatment options and medical interventions

**Self-Care Strategies:**
• Daily habits that support health related to ${topic}
• Warning signs that require immediate attention
• Resources for reliable health information
• Building a support system for health and wellness`,
      type: 'example',
      duration: 10,
      module: 'Practical Health'
    });
  }

  /**
   * Enhanced generic slides using web search results and creative diagrams
   */
  private static async addEnhancedGenericSlides(
    slides: SlideData[], 
    demos: DemoData[], 
    searchResults: any, 
    creativeDiagram: any, 
    topic: string,
    aiResponse?: string
  ): Promise<void> {
    // Extract key information from search results
    const searchInfo = this.extractSearchInfo(searchResults);
    
    // Slide 1: Introduction with AI response and web-enhanced content
    slides.push({
      id: 'enhanced-intro',
      title: `Understanding ${topic}`,
      content: `## Welcome to ${topic}

${aiResponse ? `**AI Tutor's Response:**
${aiResponse}

---

` : ''}${searchInfo.mainDescription || `${topic} is an important concept that plays a significant role in our world and offers valuable insights for learning and application.`}

**What Makes ${topic} Important:**
${searchInfo.keyPoints.map(point => `• ${point}`).join('\n') || `• Relevant to many aspects of life and work
• Provides useful knowledge and skills
• Has practical applications and benefits
• Worth understanding for personal and professional growth`}

**Current Relevance:**
Based on latest information, ${topic} continues to evolve and impact various sectors with new developments and applications.`,
      type: 'intro',
      duration: 10,
      module: 'Introduction'
    });

    // Slide 2: Core Concepts with search-enhanced content
    slides.push({
      id: 'enhanced-concepts',
      title: `Core Concepts of ${topic}`,
      content: `## Understanding the Fundamentals

**Key Aspects:**
${searchInfo.concepts.map(concept => `• **${concept.title}**: ${concept.description}`).join('\n') || `• **Definition**: What ${topic} means and encompasses
• **Purpose**: Why ${topic} exists and what it accomplishes
• **Scope**: The range and extent of ${topic}'s influence
• **Components**: Essential elements that make up ${topic}`}

**Current Understanding:**
Recent research and developments have enhanced our understanding of ${topic}, revealing new insights about its mechanisms and applications.`,
      type: 'concept',
      duration: 10,
      module: 'Fundamentals'
    });

    // Slide 3: Applications with real-world examples from search
    slides.push({
      id: 'enhanced-applications',
      title: `${topic} in Practice`,
      content: `## Real-World Applications

**Current Applications:**
${searchInfo.applications.map(app => `• **${app.area}**: ${app.description}`).join('\n') || `• **Professional Settings**: How businesses and organizations apply ${topic}
• **Daily Life**: Ways ${topic} appears in everyday situations
• **Industry Applications**: Specific fields that rely on ${topic}
• **Problem Solving**: Types of challenges ${topic} helps address`}

**Recent Developments:**
${searchInfo.trends || `New trends in ${topic} are creating exciting opportunities and solving previously challenging problems.`}

**Success Stories:**
Real-world implementations of ${topic} have shown measurable improvements and positive outcomes across various industries.`,
      type: 'example',
      duration: 10,
      module: 'Applications'
    });

    // Slide 4: Creative Diagram
    slides.push({
      id: 'enhanced-diagram',
      title: creativeDiagram.title || `How ${topic} Works`,
      content: `## Visual Understanding

This diagram illustrates the key components and relationships within ${topic}, showing how different elements work together based on current understanding.

**Process Overview:**
${creativeDiagram.nodes ? creativeDiagram.nodes.map((node: any, index: number) => 
  `${index + 1}. **${node.label}**: ${this.getNodeDescription(node.type)}`).join('\n') : 
  `• Input elements that start the process
• Core operations that transform or process information
• Decision points that guide the flow
• Output results that provide value`}

**Key Insights:**
Understanding these connections helps you see the bigger picture of how ${topic} functions and creates value in real-world scenarios.`,
      type: 'diagram',
      duration: 10,
      module: 'Process Flow',
      diagram: creativeDiagram.nodes ? {
        title: creativeDiagram.title,
        nodes: creativeDiagram.nodes,
        connections: creativeDiagram.connections,
        layout: creativeDiagram.layout,
        theme: creativeDiagram.theme
      } : undefined
    });

    // Slide 5: Enhanced Conclusion
    slides.push({
      id: 'enhanced-conclusion',
      title: `${topic}: Key Insights and Future Outlook`,
      content: `## What We've Learned

${aiResponse ? `**AI Tutor's Guidance:**
Remember: ${aiResponse}

` : ''}**Key Takeaways:**
${searchInfo.takeaways.map(takeaway => `• ${takeaway}`).join('\n') || `• ${topic} is an important concept with wide-ranging applications
• Understanding ${topic} provides valuable knowledge and skills
• Practical applications exist in many different contexts
• The principles of ${topic} can be applied to solve real problems`}

**Future Outlook:**
${searchInfo.futureOutlook || `The future of ${topic} looks promising with continued innovation and new applications emerging regularly.`}

**Your Next Steps:**
• Stay updated with the latest developments in ${topic}
• Apply what you've learned in relevant situations
• Explore specific areas that align with your interests
• Connect with communities and experts in the field

Continue exploring ${topic} to unlock its full potential and stay ahead of emerging trends!`,
      type: 'summary',
      duration: 10,
      module: 'Conclusion'
    });
  }

  /**
   * Enhanced Machine Learning slides with web search
   */
  private static async addEnhancedMachineLearningSlides(
    slides: SlideData[], 
    demos: DemoData[], 
    searchResults: any, 
    creativeDiagram: any
  ): Promise<void> {
    // Use the creative diagram from the generator
    const mlDiagram = creativeDiagram;
    
    // Slide 1: Introduction with current ML trends
    slides.push({
      id: 'ml-enhanced-intro',
      title: 'Machine Learning: The AI Revolution',
      content: `## Welcome to Machine Learning

Machine Learning is revolutionizing how we solve problems and make decisions, representing one of the most significant technological advances of our time.

**What Makes ML Revolutionary:**
• Computers learn and improve from experience automatically
• Processes vast amounts of data faster than humans
• Discovers patterns invisible to traditional analysis
• Powers breakthrough technologies like ChatGPT, autonomous vehicles, and medical diagnosis

**Current Impact:**
Machine Learning is transforming industries from healthcare to finance, creating new possibilities and solving previously impossible challenges.`,
      type: 'intro',
      duration: 10,
      module: 'Introduction'
    });

    // Continue with enhanced slides...
    this.addMachineLearningSlides(slides, demos);
    
    // Replace the diagram slide with the creative one
    const diagramSlideIndex = slides.findIndex(slide => slide.id === 'ml-diagram');
    if (diagramSlideIndex !== -1) {
      slides[diagramSlideIndex] = {
        ...slides[diagramSlideIndex],
        diagram: {
          title: mlDiagram.title,
          nodes: mlDiagram.nodes,
          connections: mlDiagram.connections,
          layout: mlDiagram.layout,
          theme: mlDiagram.theme
        }
      };
    }
  }

  /**
   * Extract useful information from search results
   */
  private static extractSearchInfo(searchResults: any): {
    mainDescription: string;
    keyPoints: string[];
    concepts: Array<{title: string; description: string}>;
    applications: Array<{area: string; description: string}>;
    trends: string;
    takeaways: string[];
    futureOutlook: string;
  } {
    if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
      return {
        mainDescription: '',
        keyPoints: [],
        concepts: [],
        applications: [],
        trends: '',
        takeaways: [],
        futureOutlook: ''
      };
    }

    const results = searchResults.results;
    const mainResult = results[0];
    
    return {
      mainDescription: mainResult.snippet || '',
      keyPoints: results.slice(0, 3).map((r: any) => this.extractKeyPoint(r.snippet)),
      concepts: results.slice(0, 2).map((r: any) => ({
        title: this.extractConceptTitle(r.title),
        description: this.truncateText(r.snippet, 100)
      })),
      applications: results.slice(1, 3).map((r: any) => ({
        area: this.extractApplicationArea(r.title),
        description: this.truncateText(r.snippet, 80)
      })),
      trends: results.length > 1 ? this.truncateText(results[1].snippet, 120) : '',
      takeaways: results.slice(0, 4).map((r: any) => this.extractTakeaway(r.snippet)),
      futureOutlook: results.length > 2 ? this.truncateText(results[2].snippet, 100) : ''
    };
  }

  private static extractKeyPoint(snippet: string): string {
    const sentences = snippet.split('.').filter(s => s.trim().length > 10);
    return sentences[0]?.trim() || snippet.substring(0, 80) + '...';
  }

  private static extractConceptTitle(title: string): string {
    return title.split(':')[0]?.trim() || title.split('-')[0]?.trim() || 'Key Concept';
  }

  private static extractApplicationArea(title: string): string {
    const areas = ['Business', 'Technology', 'Healthcare', 'Education', 'Research', 'Industry'];
    const foundArea = areas.find(area => title.toLowerCase().includes(area.toLowerCase()));
    return foundArea || 'General Application';
  }

  private static extractTakeaway(snippet: string): string {
    const sentences = snippet.split('.').filter(s => s.trim().length > 5);
    return sentences[0]?.trim() || snippet.substring(0, 60) + '...';
  }

  private static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  private static getNodeDescription(nodeType: string): string {
    switch (nodeType) {
      case 'start': return 'Initial input or trigger point';
      case 'process': return 'Processing or transformation step';
      case 'decision': return 'Decision or evaluation point';
      case 'concept': return 'Key concept or component';
      case 'end': return 'Final output or result';
      default: return 'Process component';
    }
  }

  // Add placeholder methods for other enhanced slide types
  private static async addEnhancedPhotosynthesisSlides(slides: SlideData[], demos: DemoData[], searchResults: any, creativeDiagram: any): Promise<void> {
    return this.addEnhancedGenericSlides(slides, demos, searchResults, creativeDiagram, 'Photosynthesis');
  }

  private static async addEnhancedQuantumSlides(slides: SlideData[], demos: DemoData[], searchResults: any, creativeDiagram: any, topic: string): Promise<void> {
    return this.addEnhancedGenericSlides(slides, demos, searchResults, creativeDiagram, topic);
  }

  private static async addEnhancedProgrammingSlides(slides: SlideData[], demos: DemoData[], searchResults: any, creativeDiagram: any, topic: string): Promise<void> {
    return this.addEnhancedGenericSlides(slides, demos, searchResults, creativeDiagram, topic);
  }

  private static async addEnhancedBusinessSlides(slides: SlideData[], demos: DemoData[], searchResults: any, creativeDiagram: any, topic: string): Promise<void> {
    return this.addEnhancedGenericSlides(slides, demos, searchResults, creativeDiagram, topic);
  }

  private static async addEnhancedScienceSlides(slides: SlideData[], demos: DemoData[], searchResults: any, creativeDiagram: any, topic: string): Promise<void> {
    return this.addEnhancedGenericSlides(slides, demos, searchResults, creativeDiagram, topic);
  }

  private static async addEnhancedTechnologySlides(slides: SlideData[], demos: DemoData[], searchResults: any, creativeDiagram: any, topic: string): Promise<void> {
    return this.addEnhancedGenericSlides(slides, demos, searchResults, creativeDiagram, topic);
  }

  private static async addEnhancedMathematicsSlides(slides: SlideData[], demos: DemoData[], searchResults: any, creativeDiagram: any, topic: string): Promise<void> {
    return this.addEnhancedGenericSlides(slides, demos, searchResults, creativeDiagram, topic);
  }

  private static async addEnhancedHistorySlides(slides: SlideData[], demos: DemoData[], searchResults: any, creativeDiagram: any, topic: string): Promise<void> {
    return this.addEnhancedGenericSlides(slides, demos, searchResults, creativeDiagram, topic);
  }

  private static async addEnhancedHealthSlides(slides: SlideData[], demos: DemoData[], searchResults: any, creativeDiagram: any, topic: string): Promise<void> {
    return this.addEnhancedGenericSlides(slides, demos, searchResults, creativeDiagram, topic);
  }

  private static addGenericSlides(slides: SlideData[], demos: DemoData[], topic: string): void {
    // Slide 1: Introduction
    slides.push({
      id: 'generic-intro',
      title: `Understanding ${topic}`,
      content: `## Welcome to ${topic}

${topic} is an important concept that plays a significant role in our world and offers valuable insights for learning and application.

**What Makes ${topic} Important:**
• Relevant to many aspects of life and work
• Provides useful knowledge and skills
• Has practical applications and benefits
• Worth understanding for personal and professional growth

**What You'll Discover:**
We'll explore the key aspects, applications, and significance of ${topic} to give you a comprehensive understanding of this important subject.`,
      type: 'intro',
      duration: 10,
      module: 'Introduction'
    });

    // Slide 2: Core Concepts
    slides.push({
      id: 'generic-concepts',
      title: `Core Concepts of ${topic}`,
      content: `## Understanding the Fundamentals

**Key Aspects:**
• **Definition**: What ${topic} means and encompasses
• **Purpose**: Why ${topic} exists and what it accomplishes
• **Scope**: The range and extent of ${topic}'s influence
• **Components**: Essential elements that make up ${topic}

**Core Principles:**
• Fundamental concepts that define ${topic}
• Basic rules or patterns that govern how ${topic} works
• Important relationships between different aspects
• Underlying logic and reasoning behind ${topic}`,
      type: 'concept',
      duration: 10,
      module: 'Fundamentals'
    });

    // Slide 3: Applications and Examples
    slides.push({
      id: 'generic-applications',
      title: `${topic} in Practice`,
      content: `## Real-World Applications

**Where ${topic} is Used:**
• **Professional Settings**: How businesses and organizations apply ${topic}
• **Daily Life**: Ways ${topic} appears in everyday situations
• **Industry Applications**: Specific fields that rely on ${topic}
• **Problem Solving**: Types of challenges ${topic} helps address

**Benefits and Advantages:**
• Improves efficiency and effectiveness
• Provides better outcomes and results
• Offers new opportunities and possibilities
• Creates value in various contexts

**Practical Examples:**
• Specific instances where ${topic} makes a difference
• Success stories and case studies
• Measurable improvements and results`,
      type: 'example',
      duration: 10,
      module: 'Applications'
    });

    // Slide 4: Smart Diagram
    slides.push({
      id: 'generic-diagram',
      title: `How ${topic} Works`,
      content: `## Visual Understanding

This diagram illustrates the key components and relationships within ${topic}, showing how different elements work together.

**Process Overview:**
• Input elements that start the process
• Core operations that transform or process information
• Decision points that guide the flow
• Output results that provide value

Understanding these connections helps you see the bigger picture of how ${topic} functions and creates value.`,
      type: 'diagram',
      duration: 10,
      module: 'Process Flow',
      diagram: {
        title: `${topic} Process Flow`,
        nodes: [
          { id: 'input', label: 'Input', type: 'start', position: { x: 20, y: 50 } },
          { id: 'process1', label: 'Analysis', type: 'process', position: { x: 40, y: 30 } },
          { id: 'process2', label: 'Processing', type: 'process', position: { x: 60, y: 50 } },
          { id: 'decision', label: 'Evaluation', type: 'decision', position: { x: 40, y: 70 } },
          { id: 'output', label: 'Result', type: 'end', position: { x: 80, y: 50 } }
        ],
        connections: [
          { from: 'input', to: 'process1', label: 'Start' },
          { from: 'process1', to: 'process2', label: 'Transform' },
          { from: 'process2', to: 'decision', label: 'Check' },
          { from: 'decision', to: 'output', label: 'Complete' },
          { from: 'process2', to: 'output', label: 'Direct' }
        ]
      }
    });

    // Slide 5: Conclusion
    slides.push({
      id: 'generic-conclusion',
      title: `${topic}: Key Insights and Next Steps`,
      content: `## What We've Learned

**Key Takeaways:**
• ${topic} is an important concept with wide-ranging applications
• Understanding ${topic} provides valuable knowledge and skills
• Practical applications exist in many different contexts
• The principles of ${topic} can be applied to solve real problems

**Why This Matters:**
Knowledge of ${topic} empowers you to make better decisions, solve problems more effectively, and understand the world around you more clearly.

**Your Next Steps:**
• Apply what you've learned about ${topic} in relevant situations
• Explore specific areas of ${topic} that interest you most
• Seek out additional resources to deepen your understanding
• Share your knowledge with others who might benefit

Continue exploring and applying the concepts of ${topic} to unlock its full potential!`,
      type: 'summary',
      duration: 10,
      module: 'Conclusion'
    });
  }

  /**
   * AI-powered slide content generation
   */
  private static async generateAISlideContent(topic: string, userResponse?: string): Promise<any> {
    const prompt = `You are an expert educational content creator. Create comprehensive, engaging content for a 5-slide presentation about "${topic}".

${userResponse ? `The student asked about this topic and received this initial response: "${userResponse}"` : ''}

Generate detailed content for exactly 5 slides:
1. Introduction - Welcome and overview with learning objectives
2. Core Concepts - Key principles and fundamental ideas  
3. Real-World Applications - Practical examples and use cases
4. Visual Explanation - Content that will accompany a diagram
5. Conclusion - Summary, key takeaways, and next steps

Requirements:
- Write in an educational, engaging tone suitable for students
- Include specific examples, analogies, and explanations
- Make content progressively build understanding
- Add helpful study tips and memory aids
- Include questions to encourage critical thinking
- Make each slide substantial but digestible
- Focus on helping students truly understand, not just memorize

Format your response as JSON with this structure:
{
  "slide1": {
    "title": "slide title",
    "content": "detailed content with explanations, examples, and learning objectives"
  },
  "slide2": {
    "title": "slide title", 
    "content": "detailed content with key concepts, definitions, and explanations"
  },
  "slide3": {
    "title": "slide title",
    "content": "detailed content with real-world applications and examples"
  },
  "slide4": {
    "title": "slide title",
    "content": "detailed content explaining what the diagram will show and why it's important"
  },
  "slide5": {
    "title": "slide title",
    "content": "detailed conclusion with summary, key takeaways, and actionable next steps"
  }
}`;

    try {
      const aiContent = await openRouterGenerateText({ user: prompt, temperature: 0.7, max_tokens: 8192 });
      
      // Parse JSON response with better error handling
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          // Clean the JSON string to remove any control characters
          const cleanedJson = jsonMatch[0].replace(/[\x00-\x1F\x7F]/g, '');
          return JSON.parse(cleanedJson);
        } catch (parseError) {
          console.error('Error parsing AI response JSON:', parseError);
          return this.createFallbackContent(topic);
        }
      }
      
      // Fallback if JSON parsing fails
      return this.createFallbackContent(topic);
    } catch (error) {
      console.error('Error generating AI slide content:', error);
      return this.createFallbackContent(topic);
    }
  }

  /**
   * AI-powered diagram generation with enhanced structure
   */
  private static async generateAIDiagram(topic: string, slideContent: any): Promise<any> {
    const prompt = `You are an expert in creating educational diagrams and data visualization. Based on the topic "${topic}" and the slide content provided, create a comprehensive, well-structured diagram.

Slide 4 content: ${slideContent.slide4?.content || 'Visual explanation of the topic'}

IMPORTANT: Create a diagram that follows these STRICT structural principles:

1. CLEAR HIERARCHY: Use proper start → process → end flow with logical progression
2. LOGICAL GROUPING: Related concepts should be visually grouped in organized blocks
3. BALANCED LAYOUT: Distribute nodes evenly for perfect visual balance and symmetry
4. MEANINGFUL CONNECTIONS: Every connection should have a clear, educational purpose
5. PROGRESSIVE COMPLEXITY: Start simple, build to more complex concepts in structured layers
6. BLOCK ORGANIZATION: Organize elements in clean, well-defined visual blocks
7. VISUAL SATISFACTION: Ensure the diagram is aesthetically pleasing and professionally structured

DIAGRAM REQUIREMENTS:
- Include exactly 6-8 nodes for optimal readability
- Use descriptive, educational labels (not just single words)
- Choose appropriate node types: start, process, concept, decision, end
- Select relevant icons/emojis that enhance understanding
- Create meaningful connection labels that explain relationships
- Choose the best layout type for the topic structure

NODE TYPES & USAGE:
- "start": Entry points, initial concepts, inputs
- "process": Actions, transformations, methods
- "concept": Key ideas, principles, definitions  
- "decision": Choice points, evaluations, conditions
- "end": Results, outputs, conclusions

LAYOUT SELECTION GUIDE:
- "hierarchical": For processes, organizational structures, taxonomies
- "horizontal": For sequential processes, timelines, workflows
- "vertical": For layered concepts, levels, stages
- "circular": For cyclical processes, interconnected systems
- "grid": For categorized information, comparisons

Format your response as JSON:
{
  "title": "Clear, Descriptive Diagram Title",
  "nodes": [
    {
      "id": "unique-descriptive-id",
      "label": "Clear Educational Label (3-5 words)",
      "type": "start|process|concept|decision|end",
      "position": {"x": 0, "y": 0},
      "icon": "📊",
      "color": "bg-blue-100 text-blue-800"
    }
  ],
  "connections": [
    {
      "from": "source-node-id",
      "to": "target-node-id", 
      "label": "Clear relationship description"
    }
  ],
  "layout": "hierarchical|horizontal|vertical|circular|grid",
  "theme": "educational"
}`;

    try {
      console.log('🎨 Generating AI diagram for:', topic);
      const aiContent = await openRouterGenerateText({ user: prompt, temperature: 0.7, max_tokens: 8192 });
      
      console.log('📊 Raw AI diagram response:', aiContent.substring(0, 200) + '...');
      
      // Clean and parse JSON response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          // Clean the JSON string to remove any control characters
          const cleanedJson = jsonMatch[0].replace(/[\x00-\x1F\x7F]/g, '');
          const parsedDiagram = JSON.parse(cleanedJson);
          
          // Validate and clean the AI-generated diagram
          const cleanDiagram = this.cleanAndValidateAIDiagram(parsedDiagram, topic);
          
          // Check if the diagram meets satisfaction standards
          const satisfactionScore = this.evaluateDiagramSatisfaction(cleanDiagram);
          console.log('📊 Diagram satisfaction score:', satisfactionScore);
          
          if (satisfactionScore >= 8) {
            console.log('✅ AI diagram generated successfully and meets high standards:', cleanDiagram.title);
          } else {
            console.log('⚠️ Diagram generated but could be improved. Score:', satisfactionScore);
          }
          
          return { ...cleanDiagram, satisfactionScore };
        } catch (parseError) {
          console.error('❌ Failed to parse AI diagram JSON:', parseError);
          return this.createFallbackDiagram(topic);
        }
      }
      
      console.warn('⚠️ No valid JSON found in AI response, using fallback');
      return this.createFallbackDiagram(topic);
    } catch (error) {
      console.error('❌ Error generating AI diagram:', error);
      return this.createFallbackDiagram(topic);
    }
  }

  /**
   * Clean and validate AI-generated diagram for optimal display
   */
  private static cleanAndValidateAIDiagram(aiDiagram: any, topic: string): any {
    // Ensure required properties exist
    const cleanDiagram = {
      title: aiDiagram.title || `${topic} Overview`,
      nodes: [],
      connections: [],
      layout: aiDiagram.layout || 'horizontal',
      theme: aiDiagram.theme || 'educational'
    };

    // Validate and clean nodes
    if (aiDiagram.nodes && Array.isArray(aiDiagram.nodes)) {
      cleanDiagram.nodes = aiDiagram.nodes
        .filter(node => node && node.id && node.label) // Remove invalid nodes
        .slice(0, 8) // Limit to 8 nodes for clean display
        .map((node, index) => ({
          id: this.cleanString(node.id) || `node-${index}`,
          label: this.cleanString(node.label) || `Node ${index + 1}`,
          type: this.validateNodeType(node.type) || 'concept',
          position: { x: 0, y: 0 }, // Reset positions for proper layout
          icon: this.cleanEmoji(node.icon) || this.getDefaultIconForType(node.type || 'concept'),
          color: this.validateColor(node.color) || this.getDefaultColorForType(node.type || 'concept')
        }));
    }

    // Ensure we have at least 4 nodes for a meaningful diagram
    if (cleanDiagram.nodes.length < 4) {
      console.warn('⚠️ AI generated too few nodes, enhancing diagram');
      return this.createFallbackDiagram(topic);
    }

    // Validate and clean connections
    if (aiDiagram.connections && Array.isArray(aiDiagram.connections)) {
      const nodeIds = cleanDiagram.nodes.map(n => n.id);
      cleanDiagram.connections = aiDiagram.connections
        .filter(conn => 
          conn && 
          conn.from && 
          conn.to && 
          nodeIds.includes(conn.from) && 
          nodeIds.includes(conn.to) &&
          conn.from !== conn.to // Prevent self-connections
        )
        .map(conn => ({
          from: this.cleanString(conn.from),
          to: this.cleanString(conn.to),
          label: this.cleanString(conn.label) || 'relates to'
        }));
    }

    // Ensure we have meaningful connections
    if (cleanDiagram.connections.length === 0) {
      console.warn('⚠️ AI generated no valid connections, creating default flow');
      cleanDiagram.connections = this.createDefaultConnections(cleanDiagram.nodes);
    }

    return cleanDiagram;
  }

  /**
   * Helper methods for cleaning AI-generated content
   */
  private static cleanString(str: string): string {
    if (!str || typeof str !== 'string') return '';
    return str
      .trim()
      .replace(/[^\w\s\-_]/g, '') // Remove special characters except spaces, hyphens, underscores
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 50); // Limit length
  }

  private static cleanEmoji(emoji: string): string {
    if (!emoji || typeof emoji !== 'string') return '';
    // Keep only the first emoji if multiple
    const emojiMatch = emoji.match(/[\u{1F300}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
    return emojiMatch ? emojiMatch[0] : '';
  }

  private static validateNodeType(type: string): string {
    const validTypes = ['start', 'process', 'concept', 'decision', 'end'];
    return validTypes.includes(type) ? type : 'concept';
  }

  private static validateColor(color: string): string {
    if (!color || typeof color !== 'string') return '';
    // Check if it's a valid Tailwind color class
    const colorPattern = /^bg-\w+-\d+\s+text-\w+-\d+$/;
    return colorPattern.test(color) ? color : '';
  }

  private static getDefaultIconForType(type: string): string {
    switch (type) {
      case 'start': return '🚀';
      case 'process': return '⚙️';
      case 'concept': return '💡';
      case 'decision': return '❓';
      case 'end': return '✅';
      default: return '📊';
    }
  }

  private static getDefaultColorForType(type: string): string {
    switch (type) {
      case 'start': return 'bg-green-100 text-green-800';
      case 'process': return 'bg-blue-100 text-blue-800';
      case 'concept': return 'bg-purple-100 text-purple-800';
      case 'decision': return 'bg-yellow-100 text-yellow-800';
      case 'end': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  private static createDefaultConnections(nodes: any[]): any[] {
    if (nodes.length < 2) return [];
    
    const connections = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      connections.push({
        from: nodes[i].id,
        to: nodes[i + 1].id,
        label: i === 0 ? 'begins with' : 
               i === nodes.length - 2 ? 'leads to' : 'then'
      });
    }
    return connections;
  }

  /**
   * Evaluate diagram satisfaction based on structure and quality
   */
  private static evaluateDiagramSatisfaction(diagram: any): number {
    let score = 0;
    
    // Check node count (optimal: 6-8 nodes) - 2 points
    const nodeCount = diagram.nodes?.length || 0;
    if (nodeCount >= 6 && nodeCount <= 8) {
      score += 2;
    } else if (nodeCount >= 4 && nodeCount <= 10) {
      score += 1;
    }
    
    // Check connection quality - 2 points
    const connectionCount = diagram.connections?.length || 0;
    if (connectionCount >= nodeCount - 1 && connectionCount <= nodeCount + 2) {
      score += 2;
    } else if (connectionCount > 0) {
      score += 1;
    }
    
    // Check node type diversity - 2 points
    const nodeTypes = new Set(diagram.nodes?.map(n => n.type) || []);
    if (nodeTypes.size >= 4) {
      score += 2;
    } else if (nodeTypes.size >= 3) {
      score += 1;
    }
    
    // Check for proper flow (start and end nodes) - 2 points
    const hasStart = diagram.nodes?.some(n => n.type === 'start');
    const hasEnd = diagram.nodes?.some(n => n.type === 'end');
    if (hasStart && hasEnd) {
      score += 2;
    } else if (hasStart || hasEnd) {
      score += 1;
    }
    
    // Check label quality - 1 point
    const hasGoodLabels = diagram.nodes?.every(n => n.label && n.label.length >= 3) || false;
    if (hasGoodLabels) {
      score += 1;
    }
    
    // Check layout appropriateness - 1 point
    const validLayouts = ['hierarchical', 'horizontal', 'vertical', 'circular', 'grid'];
    if (validLayouts.includes(diagram.layout)) {
      score += 1;
    }
    
    return score; // Max score: 10
  }

  /**
   * Build slides with AI-generated content
   */
  private static async buildAIGeneratedSlides(
    slides: SlideData[], 
    demos: DemoData[], 
    topic: string, 
    aiContent: any, 
    aiDiagram: any, 
    userResponse?: string,
    isImproved: boolean = false
  ): Promise<void> {
    const prefix = isImproved ? 'improved-' : 'ai-';
    
    // Generate visualizations for each slide
    const slideData = [
      { type: 'intro', content: aiContent.slide1?.content || `Welcome to learning about ${topic}!`, title: aiContent.slide1?.title || `Understanding ${topic}` },
      { type: 'concept', content: aiContent.slide2?.content || `Key concepts about ${topic}...`, title: aiContent.slide2?.title || `Core Concepts of ${topic}` },
      { type: 'example', content: aiContent.slide3?.content || `Real-world applications of ${topic}...`, title: aiContent.slide3?.title || `${topic} in Practice` },
      { type: 'diagram', content: aiContent.slide4?.content || `Visual explanation of ${topic}...`, title: aiContent.slide4?.title || `How ${topic} Works` },
      { type: 'summary', content: aiContent.slide5?.content || `Summary of key insights about ${topic}...`, title: aiContent.slide5?.title || `${topic}: Key Insights` }
    ];

    const visualizations = await VisualizationService.generateSlideVisualizations(topic, slideData);
    
    // Slide 1: AI-Generated Introduction
    slides.push({
      id: `${prefix}intro`,
      title: aiContent.slide1?.title || `Understanding ${topic}`,
      content: `${userResponse ? `**Your Question Answered:**\n${userResponse}\n\n---\n\n` : ''}${aiContent.slide1?.content || `Welcome to learning about ${topic}!`}`,
      type: 'intro',
      duration: 10,
      module: 'AI Introduction',
      template: 'centered',
      theme: 'blue',
      animation: 'fade',
      visualization: visualizations.get('intro') || undefined
    });

    // Slide 2: AI-Generated Core Concepts
    slides.push({
      id: `${prefix}concepts`,
      title: aiContent.slide2?.title || `Core Concepts of ${topic}`,
      content: aiContent.slide2?.content || `Key concepts about ${topic}...`,
      type: 'concept',
      duration: 10,
      module: 'AI Concepts',
      template: 'split',
      theme: 'green',
      animation: 'slide-up',
      visualization: visualizations.get('concept') || undefined
    });

    // Slide 3: AI-Generated Applications
    slides.push({
      id: `${prefix}applications`,
      title: aiContent.slide3?.title || `${topic} in Practice`,
      content: aiContent.slide3?.content || `Real-world applications of ${topic}...`,
      type: 'example',
      duration: 10,
      module: 'AI Applications',
      template: 'timeline',
      theme: 'purple',
      animation: 'zoom-in',
      visualization: visualizations.get('example') || undefined
    });

    // Slide 4: AI-Generated Diagram Slide
    slides.push({
      id: `${prefix}diagram`,
      title: aiContent.slide4?.title || `How ${topic} Works`,
      content: aiContent.slide4?.content || `Visual explanation of ${topic}...`,
      type: 'diagram',
      duration: 10,
      module: 'AI Visual Explanation',
      template: 'default',
      theme: 'orange',
      animation: 'flip-horizontal',
      visualization: visualizations.get('diagram') || undefined,
      diagram: aiDiagram.nodes ? {
        title: aiDiagram.title || `${topic} Process`,
        nodes: aiDiagram.nodes,
        connections: aiDiagram.connections,
        layout: aiDiagram.layout || 'hierarchical',
        theme: aiDiagram.theme || 'educational'
      } : undefined
    });

    // Slide 5: AI-Generated Conclusion
    slides.push({
      id: `${prefix}conclusion`,
      title: aiContent.slide5?.title || `${topic}: Key Insights`,
      content: `${aiContent.slide5?.content || `Summary of key insights about ${topic}...`}\n\n${userResponse ? `**Remember:** ${userResponse}` : ''}`,
      type: 'summary',
      duration: 10,
      module: 'AI Conclusion',
      template: 'comparison',
      theme: 'indigo',
      animation: 'bounce-in',
      visualization: visualizations.get('summary') || undefined
    });
  }

  /**
   * AI evaluation of slides before display
   */
  private static async evaluateSlides(slides: SlideData[], topic: string): Promise<boolean> {
    const slideContents = slides.map(slide => `${slide.title}: ${slide.content}`).join('\n\n');
    
    const prompt = `You are an expert educational content evaluator. Review this 5-slide presentation about "${topic}" and determine if it's ready for students.

Presentation content:
${slideContents}

Evaluate based on:
1. Educational value - Does it teach effectively?
2. Content quality - Is information accurate and well-explained?
3. Student engagement - Will it keep students interested?
4. Learning progression - Does it build understanding logically?
5. Practical value - Are there useful examples and applications?

Respond with only "APPROVED" if the presentation meets high educational standards, or "NEEDS_IMPROVEMENT" if it requires enhancement.`;

    try {
      const evaluation = (await openRouterGenerateText({ user: prompt, temperature: 0.3, max_tokens: 64 })).trim();
      
      return evaluation.includes('APPROVED');
    } catch (error) {
      console.error('Error evaluating slides:', error);
      // Default to approved if evaluation fails
      return true;
    }
  }

  /**
   * Fallback content creation
   */
  private static createFallbackContent(topic: string): any {
    return {
      slide1: {
        title: `Understanding ${topic}`,
        content: `Welcome to learning about ${topic}! This presentation will help you understand the key concepts, see real-world applications, and gain practical insights you can apply immediately.`
      },
      slide2: {
        title: `Core Concepts of ${topic}`,
        content: `Let's explore the fundamental principles that make ${topic} important and how these concepts form the foundation of understanding.`
      },
      slide3: {
        title: `${topic} in Practice`,
        content: `Discover how ${topic} is applied in real-world scenarios and see practical examples that demonstrate its value and importance.`
      },
      slide4: {
        title: `How ${topic} Works`,
        content: `This diagram illustrates the key processes and relationships within ${topic}, showing how different elements work together to create results.`
      },
      slide5: {
        title: `${topic}: Next Steps`,
        content: `You've learned the essentials of ${topic}. Continue exploring, practice applying these concepts, and build on this foundation for deeper understanding.`
      }
    };
  }

  /**
   * Enhanced fallback diagram creation with better structure
   */
  private static createFallbackDiagram(topic: string): any {
    // Create topic-specific structured diagrams
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('machine learning') || topicLower.includes('ai')) {
      return {
        title: `${topic} Learning Process`,
        nodes: [
          { id: 'data-input', label: 'Data Input', type: 'start', position: { x: 0, y: 0 }, icon: '📊', color: 'bg-green-100 text-green-800' },
          { id: 'preprocessing', label: 'Data Preprocessing', type: 'process', position: { x: 0, y: 0 }, icon: '🔧', color: 'bg-blue-100 text-blue-800' },
          { id: 'model-training', label: 'Model Training', type: 'process', position: { x: 0, y: 0 }, icon: '🧠', color: 'bg-purple-100 text-purple-800' },
          { id: 'evaluation', label: 'Model Evaluation', type: 'decision', position: { x: 0, y: 0 }, icon: '📈', color: 'bg-yellow-100 text-yellow-800' },
          { id: 'optimization', label: 'Optimization', type: 'process', position: { x: 0, y: 0 }, icon: '⚡', color: 'bg-orange-100 text-orange-800' },
          { id: 'deployment', label: 'Model Deployment', type: 'end', position: { x: 0, y: 0 }, icon: '🚀', color: 'bg-red-100 text-red-800' }
        ],
        connections: [
          { from: 'data-input', to: 'preprocessing', label: 'Clean & Prepare' },
          { from: 'preprocessing', to: 'model-training', label: 'Train Algorithm' },
          { from: 'model-training', to: 'evaluation', label: 'Test Performance' },
          { from: 'evaluation', to: 'optimization', label: 'Improve' },
          { from: 'optimization', to: 'deployment', label: 'Production Ready' }
        ],
        layout: 'horizontal',
        theme: 'educational'
      };
    }

    if (topicLower.includes('photosynthesis') || topicLower.includes('plant')) {
      return {
        title: `${topic} Process Flow`,
        nodes: [
          { id: 'sunlight', label: 'Sunlight Energy', type: 'start', position: { x: 0, y: 0 }, icon: '☀️', color: 'bg-yellow-100 text-yellow-800' },
          { id: 'chloroplast', label: 'Chloroplast Absorption', type: 'process', position: { x: 0, y: 0 }, icon: '🌿', color: 'bg-green-100 text-green-800' },
          { id: 'water-co2', label: 'Water + CO₂', type: 'concept', position: { x: 0, y: 0 }, icon: '💧', color: 'bg-blue-100 text-blue-800' },
          { id: 'chemical-reaction', label: 'Chemical Reaction', type: 'process', position: { x: 0, y: 0 }, icon: '⚡', color: 'bg-purple-100 text-purple-800' },
          { id: 'glucose', label: 'Glucose Production', type: 'concept', position: { x: 0, y: 0 }, icon: '🍯', color: 'bg-orange-100 text-orange-800' },
          { id: 'oxygen', label: 'Oxygen Release', type: 'end', position: { x: 0, y: 0 }, icon: '💨', color: 'bg-cyan-100 text-cyan-800' }
        ],
        connections: [
          { from: 'sunlight', to: 'chloroplast', label: 'Captures Light' },
          { from: 'chloroplast', to: 'chemical-reaction', label: 'Initiates Process' },
          { from: 'water-co2', to: 'chemical-reaction', label: 'Raw Materials' },
          { from: 'chemical-reaction', to: 'glucose', label: 'Produces Energy' },
          { from: 'chemical-reaction', to: 'oxygen', label: 'Releases Byproduct' }
        ],
        layout: 'hierarchical',
        theme: 'educational'
      };
    }

    // Generic structured fallback for any topic
    return {
      title: `Understanding ${topic}`,
      nodes: [
        { id: 'introduction', label: `Introduction to ${topic}`, type: 'start', position: { x: 0, y: 0 }, icon: '🎯', color: 'bg-blue-100 text-blue-800' },
        { id: 'key-concepts', label: 'Key Concepts', type: 'concept', position: { x: 0, y: 0 }, icon: '💡', color: 'bg-green-100 text-green-800' },
        { id: 'practical-application', label: 'Practical Application', type: 'process', position: { x: 0, y: 0 }, icon: '⚙️', color: 'bg-purple-100 text-purple-800' },
        { id: 'real-world-examples', label: 'Real-World Examples', type: 'concept', position: { x: 0, y: 0 }, icon: '🌍', color: 'bg-yellow-100 text-yellow-800' },
        { id: 'benefits-outcomes', label: 'Benefits & Outcomes', type: 'process', position: { x: 0, y: 0 }, icon: '📈', color: 'bg-orange-100 text-orange-800' },
        { id: 'mastery-next-steps', label: 'Mastery & Next Steps', type: 'end', position: { x: 0, y: 0 }, icon: '🎓', color: 'bg-red-100 text-red-800' }
      ],
      connections: [
        { from: 'introduction', to: 'key-concepts', label: 'Learn Fundamentals' },
        { from: 'key-concepts', to: 'practical-application', label: 'Apply Knowledge' },
        { from: 'practical-application', to: 'real-world-examples', label: 'See Examples' },
        { from: 'real-world-examples', to: 'benefits-outcomes', label: 'Understand Impact' },
        { from: 'benefits-outcomes', to: 'mastery-next-steps', label: 'Continue Learning' }
      ],
      layout: 'horizontal',
      theme: 'educational'
    };
  }
}

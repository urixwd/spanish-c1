export interface TopicDef {
	name: string;
	description: string;
	category: 'grammar' | 'vocabulary';
}

export const topics: Record<string, TopicDef> = {
	// C1 Grammar
	subjuntivo_presente: { name: 'Subjuntivo Presente', description: 'Triggers, formation, irregular forms', category: 'grammar' },
	subjuntivo_imperfecto: { name: 'Subjuntivo Imperfecto', description: '-ra/-se forms, hypothetical clauses', category: 'grammar' },
	subjuntivo_pluscuam: { name: 'Subjuntivo Pluscuamperfecto', description: 'Counterfactuals, wish expressions', category: 'grammar' },
	subjuntivo_triggers: { name: 'Subjuntivo Triggers', description: 'WEIRDO, conjunctions (antes de que, para que, etc.)', category: 'grammar' },
	ser_estar: { name: 'Ser vs Estar', description: 'Advanced: passive, resultant state, meaning changes', category: 'grammar' },
	ser_estar_haber: { name: 'Haber Existential', description: 'Hay/había/habrá, common errors', category: 'grammar' },
	por_para: { name: 'Por vs Para', description: 'Advanced distinctions, fixed expressions', category: 'grammar' },
	verbal_regime: { name: 'Verbal Regime', description: 'Preposition governed by verb (depender de, insistir en, etc.)', category: 'grammar' },
	conditionals: { name: 'Conditionals', description: 'Mixed conditionals, si + pluperfect subjunctive', category: 'grammar' },
	relative_clauses: { name: 'Relative Clauses', description: 'Indicative vs subjunctive in relatives, el que/quien/cuyo', category: 'grammar' },
	reported_speech: { name: 'Reported Speech', description: 'Tense backshift, reporting verbs', category: 'grammar' },
	connectors: { name: 'Discourse Connectors', description: 'No obstante, sin embargo, a pesar de que, etc.', category: 'grammar' },
	perifrasis: { name: 'Periphrastic Verbs', description: 'Ir a + inf, llevar + gerund, acabar de + inf, etc.', category: 'grammar' },
	passive_voice: { name: 'Passive Constructions', description: 'Ser + past participle, passive se, impersonal se', category: 'grammar' },
	mixed: { name: 'Mixed / General', description: 'Cross-topic questions', category: 'grammar' },

	// Vocabulary & Culture (opt-in only)
	verbos_cambio: { name: 'Verbos de Cambio', description: 'Ponerse, volverse, hacerse, quedarse, convertirse en, llegar a ser', category: 'vocabulary' },
	dichos_refranes: { name: 'Dichos y Refranes', description: 'A buen entendedor pocas palabras bastan, No hay mal que por bien no venga, etc.', category: 'vocabulary' },
	modismos: { name: 'Modismos y Expresiones Coloquiales', description: 'Comerse un marrón, irse por las ramas, estar al loro, molar, flipar, etc.', category: 'vocabulary' },
};

export type TopicId = keyof typeof topics;
export const topicIds = Object.keys(topics) as TopicId[];
export const grammarTopicIds = topicIds.filter((id) => topics[id].category === 'grammar');
export const vocabTopicIds = topicIds.filter((id) => topics[id].category === 'vocabulary');

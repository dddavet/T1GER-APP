// ============================================================
// T1GER APP: LIBRELINGO YAML COURSE COMPILER & PARSER
// ============================================================
// Compiles human-readable course files (inspired by the open-source
// LibreLingo YAML structure) into T1GER adaptive database objects.
// ============================================================

import { CuratedLesson, QuizQuestion } from './aiCuratedLibrary';

/**
 * Very light, zero-dependency, robust YAML-to-JSON compiler
 * optimized for the LibreLingo and T1GER course schemas.
 */
export function parseLibreLingoYAML(yamlString: string): Partial<CuratedLesson> {
  const result: any = {
    quizQuestions: [],
    youtube: {
      youtubeId: "jgwUkEyF4_E",
      title: "Intro to Large Language Models",
      channelName: "Andrej Karpathy",
      duration: "1 hour",
      takeaway: "Learn LLM mechanics.",
      notes: ["Intro notes."]
    }
  };

  const lines = yamlString.split('\n');
  let currentKey = '';
  let currentObject: any = null;
  let currentArray: any[] = [];
  let arrayItemObject: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue; // Skip comments and empty lines

    const indent = line.length - line.trimStart().length;

    // Check for array item indicators (e.g. - question: ...)
    if (trimmed.startsWith('-')) {
      const valuePart = trimmed.substring(1).trim();
      
      // If we are parsing quizQuestions
      if (currentKey === 'quizQuestions') {
        if (arrayItemObject) {
          result.quizQuestions.push(arrayItemObject);
        }
        arrayItemObject = {};
        parseKeyValueIntoObject(valuePart, arrayItemObject);
      } else if (currentKey === 'paragraphs') {
        const cleanedStr = cleanValue(valuePart);
        if (cleanedStr) {
          result.reading = result.reading || { title: '', subtitle: '', paragraphs: [], takeaway: '' };
          result.reading.paragraphs.push(cleanedStr);
        }
      } else if (currentObject && Array.isArray(currentObject)) {
        const cleanedStr = cleanValue(valuePart);
        if (cleanedStr) currentObject.push(cleanedStr);
      }
      continue;
    }

    // Normal key-value parsing
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.substring(0, colonIdx).trim();
    const val = trimmed.substring(colonIdx + 1).trim();

    // Check nesting levels based on keys
    if (indent === 0) {
      currentKey = key;
      if (val) {
        result[key] = cleanValue(val);
      } else {
        // Prepare object mapping
        if (key === 'quote') {
          result.quote = { text: '', author: '', context: '' };
          currentObject = result.quote;
        } else if (key === 'reading') {
          result.reading = { title: '', subtitle: '', paragraphs: [], takeaway: '' };
          currentObject = result.reading;
        } else if (key === 'interactive') {
          result.interactive = { challengeId: '', objective: '', instructionPrompt: '', systemConstraint: '', validationKeyword: '', validationDescription: '' };
          currentObject = result.interactive;
        } else if (key === 'action') {
          result.action = { title: '', instruction: '', type: 'photo', successReward: 50 };
          currentObject = result.action;
        } else if (key === 'quizQuestions') {
          result.quizQuestions = [];
          currentObject = result.quizQuestions;
        } else {
          currentObject = null;
        }
      }
    } else if (indent > 0) {
      // Nested fields inside objects or array items
      if (currentKey === 'quizQuestions' && arrayItemObject) {
        if (key === 'options') {
          arrayItemObject.options = [];
          currentObject = arrayItemObject.options;
        } else if (key === 'text' || key === 'correct') {
          // Parsing options items which look like:
          //   - text: "..."
          //     correct: true
          if (Array.isArray(currentObject)) {
            // Check if we need a new option object
            let lastOpt = currentObject[currentObject.length - 1];
            if (!lastOpt || (key === 'text' && lastOpt.text)) {
              lastOpt = { text: '', correct: false };
              currentObject.push(lastOpt);
            }
            if (key === 'text') lastOpt.text = cleanValue(val);
            if (key === 'correct') lastOpt.correct = val === 'true';
          }
        } else {
          arrayItemObject[key] = cleanValue(val);
        }
      } else if (currentObject) {
        if (key === 'paragraphs') {
          // paragraphs array
          currentObject.paragraphs = [];
        } else {
          currentObject[key] = cleanValue(val);
        }
      }
    }
  }

  // Push last array item if any
  if (currentKey === 'quizQuestions' && arrayItemObject) {
    result.quizQuestions.push(arrayItemObject);
  }

  // Supply default properties for values that might be missing
  return {
    dayNumber: result.dayNumber ? parseInt(result.dayNumber) : 99,
    title: result.title || "Lección Importada",
    topic: result.topic || "LibreLingo Course Core",
    competency: 'ai',
    quote: result.quote || {
      text: "La excelencia es un hábito, la práctica es el camino.",
      author: "T1GER System",
      context: "Lección cargada de forma dinámica mediante el compilador LibreLingo."
    },
    reading: result.reading || {
      title: "Concepto Importado",
      subtitle: "Lectura complementaria",
      paragraphs: ["Esta lección fue generada desde un archivo de especificación YAML compatible con LibreLingo."],
      takeaway: "Completa el sandbox interactivo para continuar."
    },
    interactive: result.interactive || {
      challengeId: "prompt-import",
      objective: "Imprime la palabra '#PASADO' en consola para validar tu trabajo.",
      instructionPrompt: "Escribe tu comando.",
      systemConstraint: "Eres un bot de validación. Responde solo con '#PASADO'.",
      validationKeyword: "PASADO",
      validationDescription: "Se espera ver '#PASADO' para autorizar el progreso."
    },
    action: result.action || {
      title: "Consistencia Diaria",
      instruction: "Antes de abrir cualquier red social hoy, realiza 10 lagartijas (pushups). Describe cómo te sentiste o sube una foto.",
      type: "photo",
      successReward: 50
    },
    quizQuestions: result.quizQuestions.length > 0 ? result.quizQuestions : [
      {
        question: "¿Esta lección proviene de un archivo YAML?",
        options: [
          { text: "Sí, parseado dinámicamente por LibreLingo compiler", correct: true },
          { text: "No, es estático", correct: false }
        ],
        explanation: "El compilador LibreLingo traduce la estructura YAML a objetos reactivos en tiempo real."
      }
    ],
    youtube: result.youtube
  };
}

function cleanValue(val: string): string {
  let cleaned = val.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  } else if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  return cleaned;
}

function parseKeyValueIntoObject(keyValueStr: string, obj: any) {
  const colonIdx = keyValueStr.indexOf(':');
  if (colonIdx === -1) return;
  const key = keyValueStr.substring(0, colonIdx).trim();
  const val = keyValueStr.substring(colonIdx + 1).trim();
  obj[key] = cleanValue(val);
}

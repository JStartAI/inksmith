import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, projectTitle, message, conversationHistory } = body;

    // Get project context
    const project = await base44.entities.Project.filter({ id: projectId });
    const documents = await base44.entities.Document.filter({ project_id: projectId });
    const characters = await base44.entities.Character.filter({ project_id: projectId });

    // Build context for LLM
    const context = `
Eres un asistente de escritura conversacional para InkSmith, una aplicación de escritura creativa.
Tu nombre es InkSmith Assistant.

CONTEXTO DEL PROYECTO:
- Título: ${projectTitle}
- Total de documentos: ${documents.length}
- Total de personajes: ${characters.length}

DOCUMENTOS:
${documents.slice(0, 10).map(d => `- ${d.title} (${d.type}, ${d.word_count || 0} palabras)`).join('\n')}

PERSONAJES:
${characters.slice(0, 5).map(c => `- ${c.name} (${c.role})`).join('\n')}

TU ROL:
- Asiste al escritor en la creación de su novela
- Responde preguntas sobre el proyecto
- Sugiere mejoras, ideas y desarrollo de tramas
- Puedes ejecutar comandos como: "ir a editor", "crear nuevo documento", "ver personajes", "exportar", "ir a corrección"
- Sé conversacional, amigable y útil
- Responde en español

HISTORIAL DE CONVERSACIÓN:
${conversationHistory.map(msg => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`).join('\n')}

USUARIO: ${message}

Responde de forma conversacional. Si detectas que el usuario quiere ejecutar una acción (cambiar vista, crear documento, etc), incluye una acción JSON al final en este formato:
[ACTION]{"action": "comando"}[/ACTION]

Comandos disponibles:
- "go-editor" (abrir editor)
- "go-plot" (ver trama)
- "go-corkboard" (vista corkboard)
- "go-outliner" (vista outliner)
- "go-correction" (modo corrección)
- "go-characters" (ir a personajes)
- "go-aiforge" (ir a AIForge)
- "go-compiler" (ir a exportar)
- "new-document" (crear nuevo documento)
- "create-snapshot" (crear snapshot)

Importante: Solo responde con texto conversacional. Si necesitas un comando, añádelo al final en el formato especificado.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: context,
      model: 'gpt_5_mini'
    });

    // Parse action from response if present
    let action = null;
    let cleanResponse = response;

    const actionMatch = response.match(/\[ACTION\](.*?)\[\/ACTION\]/);
    if (actionMatch) {
      try {
        action = JSON.parse(actionMatch[1]).action;
        cleanResponse = response.replace(/\[ACTION\].*?\[\/ACTION\]/, '').trim();
      } catch (e) {
        // If JSON parse fails, just use the response as is
      }
    }

    return Response.json({
      response: cleanResponse,
      action: action
    });
  } catch (error) {
    console.error('Voice Assistant Error:', error);
    return Response.json({ 
      error: error.message,
      response: 'Disculpa, ocurrió un error procesando tu solicitud.'
    }, { status: 500 });
  }
});
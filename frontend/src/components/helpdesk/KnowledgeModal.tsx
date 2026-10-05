'use client';

import React, { useState } from 'react';
import { KnowledgeArticle, CreateKnowledgeArticlePayload } from '@/types/helpdesk';

interface KnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  article?: KnowledgeArticle | null;
  mode: 'VIEW' | 'CREATE';
  onCreate?: (payload: CreateKnowledgeArticlePayload) => Promise<void>;
  onHelpful?: (id: string) => Promise<void>;
  currentUser?: string;
}

export const KnowledgeModal: React.FC<KnowledgeModalProps> = ({
  isOpen,
  onClose,
  article,
  mode,
  onCreate,
  onHelpful,
  currentUser = 'Técnico de Soporte TI',
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('HARDWARE');
  const [summary, setSummary] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [solutionSteps, setSolutionSteps] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !solutionSteps.trim()) {
      setError('El título y los pasos de solución son obligatorios');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const tags = tagsInput
        ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
        : [category];

      if (onCreate) {
        await onCreate({
          title,
          category,
          summary,
          symptoms: symptoms || undefined,
          solutionSteps,
          tags,
          authorTechnicianName: currentUser,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al publicar artículo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoteHelpful = async () => {
    if (!article || voted || !onHelpful) return;
    try {
      await onHelpful(article.id);
      setVoted(true);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base md:text-lg">
              {mode === 'CREATE' ? 'Publicar Guía en Base de Conocimientos (RF-14)' : 'Guía de Solución Técnica TI'}
            </h3>
            <p className="text-xs text-blue-200">
              {mode === 'CREATE' ? 'Estandarización de procedimientos para soporte municipal' : article?.category}
            </p>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {mode === 'CREATE' ? (
          <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título de la Falla o Solución *:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Procedimiento para solucionar atasco de papel en Epson L5590"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoría *:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="HARDWARE">HARDWARE</option>
                  <option value="SOFTWARE">SOFTWARE</option>
                  <option value="RED_INTERNET">RED / INTERNET</option>
                  <option value="PERMISOS">PERMISOS / ACCESOS</option>
                  <option value="OTROS">OTROS</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resumen Breve del Problema *:
              </label>
              <input
                type="text"
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Breve descripción ejecutiva de la incidencia que resuelve..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Síntomas Comunes que presenta el usuario:
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={2}
                placeholder="Ej. LED parpadea en naranja, mensaje de error en pantalla..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Guía de Solución Paso a Paso *:
              </label>
              <textarea
                value={solutionSteps}
                onChange={(e) => setSolutionSteps(e.target.value)}
                required
                rows={6}
                placeholder="1. Desconectar el equipo de la corriente...&#10;2. Retirar la compuerta posterior...&#10;3. Limpiar con alcohol isopropílico..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Etiquetas / Tags (separados por coma):
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Impresora, EcoTank, Atasco, Rodillos"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
              >
                {submitting ? 'Publicando...' : 'Publicar en Base de Conocimientos'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4 overflow-y-auto">
            {article && (
              <>
                <div className="border-b pb-3">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                      {article.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      Vistas: {article.viewsCount} | Autor: {article.authorTechnicianName}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{article.title}</h2>
                  <p className="text-xs text-slate-600 mt-1">{article.summary}</p>
                </div>

                {article.symptoms && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
                    <span className="font-semibold text-amber-900 block mb-1">Síntomas Reportados:</span>
                    <p className="text-amber-800">{article.symptoms}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Procedimiento de Solución Estandarizado:
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                    {article.solutionSteps}
                  </div>
                </div>

                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {article.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-full">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleVoteHelpful}
                      disabled={voted}
                      className={`inline-flex items-center px-3 py-1.5 rounded text-xs font-medium transition-all ${
                        voted
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {voted ? '¡Gracias por tu voto!' : '¿Te fue útil esta solución?'}
                    </button>
                    <span className="text-[11px] text-slate-400">
                      ({article.helpfulCount + (voted ? 1 : 0)} votos de utilidad)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

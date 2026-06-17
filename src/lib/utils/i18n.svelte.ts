class I18n {
	currentLocale = $state('pt');
	translations = $state<Record<string, Record<string, unknown>>>({
		pt: {
			calendar: {
				title: 'Calendário',
				agenda: 'Agenda',
				noEventsMonth: 'Nenhum evento ou atividade registrado para este mês.',
				dayDetails: 'Detalhes do Dia',
				activity: 'Atividade:',
				revisionsDone: 'revisões realizadas',
				noActivityDate: 'Nenhuma atividade ou evento registrado para esta data.'
			},
			timePicker: {
				selectTime: 'Selecionar Horário',
				hours: 'Horas',
				minutes: 'Minutos',
				confirm: 'Confirmar'
			},
			datePicker: {
				placeholder: 'Selecione uma data'
			},
			credits: {
				madeWithText: 'Feito com ⚡ por',
				createdWithText: 'Criado com'
			},
			confirmDialog: {
				confirm: 'Confirmar',
				cancel: 'Cancelar'
			},
			fileUpload: {
				placeholder: 'Arraste arquivos ou clique para selecionar',
				buttonLabel: 'Escolher arquivo',
				dropHere: 'Solte aqui para carregar',
				removeFile: 'Remover arquivo',
				filesSelected: '{count} arquivos selecionados'
			},
			loading: {
				message: 'Carregando...'
			},
			alert: {
				close: 'Fechar alerta'
			},
			quickActions: {
				open: 'Abrir ações',
				close: 'Fechar ações'
			},
			mediaDialog: {
				closeAriaLabel: 'Fechar',
				imageAlt: 'Mídia',
				videoTitle: 'Vídeo',
				title: 'Visualização de Mídia',
				notSupportedMessage: 'Tipo de mídia não suportado'
			}
		},
		en: {
			calendar: {
				title: 'Calendar',
				agenda: 'Agenda',
				noEventsMonth: 'No events or activity recorded for this month.',
				dayDetails: 'Day Details',
				activity: 'Activity:',
				revisionsDone: 'reviews completed',
				noActivityDate: 'No activity or events recorded for this date.'
			},
			timePicker: {
				selectTime: 'Select Time',
				hours: 'Hours',
				minutes: 'Minutes',
				confirm: 'Confirm'
			},
			datePicker: {
				placeholder: 'Select a date'
			},
			credits: {
				madeWithText: 'Made with ⚡ by',
				createdWithText: 'Created with'
			},
			confirmDialog: {
				confirm: 'Confirm',
				cancel: 'Cancel'
			},
			fileUpload: {
				placeholder: 'Drag files or click to select',
				buttonLabel: 'Choose file',
				dropHere: 'Drop here to upload',
				removeFile: 'Remove file',
				filesSelected: '{count} files selected'
			},
			loading: {
				message: 'Loading...'
			},
			alert: {
				close: 'Close alert'
			},
			quickActions: {
				open: 'Open actions',
				close: 'Close actions'
			},
			mediaDialog: {
				closeAriaLabel: 'Close',
				imageAlt: 'Media',
				videoTitle: 'Video',
				title: 'Media Preview',
				notSupportedMessage: 'Media type not supported'
			}
		},
		es: {
			calendar: {
				title: 'Calendario',
				agenda: 'Agenda',
				noEventsMonth: 'No hay eventos ni actividad registrada para este mes.',
				dayDetails: 'Detalles del Día',
				activity: 'Actividad:',
				revisionsDone: 'revisiones realizadas',
				noActivityDate: 'No hay actividad ni eventos registrados para esta fecha.'
			},
			timePicker: {
				selectTime: 'Seleccionar Hora',
				hours: 'Horas',
				minutes: 'Minutos',
				confirm: 'Confirmar'
			},
			datePicker: {
				placeholder: 'Seleccione una fecha'
			},
			credits: {
				madeWithText: 'Hecho con ⚡ por',
				createdWithText: 'Creado con'
			},
			confirmDialog: {
				confirm: 'Confirmar',
				cancel: 'Cancelar'
			},
			fileUpload: {
				placeholder: 'Arrastre archivos o haga clic para seleccionar',
				buttonLabel: 'Seleccionar archivo',
				dropHere: 'Arrastre aquí para cargar',
				removeFile: 'Eliminar archivo',
				filesSelected: '{count} archivos seleccionados'
			},
			loading: {
				message: 'Cargando...'
			},
			alert: {
				close: 'Cerrar alerta'
			},
			quickActions: {
				open: 'Abrir acciones',
				close: 'Cerrar acciones'
			},
			mediaDialog: {
				closeAriaLabel: 'Cerrar',
				imageAlt: 'Medio',
				videoTitle: 'Video',
				title: 'Vista previa de medios',
				notSupportedMessage: 'Tipo de medio no soportado'
			}
		}
	});

	constructor(
		initialLocale = 'pt',
		initialTranslations: Record<string, Record<string, unknown>> = {}
	) {
		this.currentLocale = initialLocale;
		// Combina traduções iniciais fornecidas pelo usuário com as padrão da biblioteca
		for (const locale of Object.keys(initialTranslations)) {
			this.addTranslations(locale, initialTranslations[locale]);
		}
	}

	setLocale(locale: string) {
		this.currentLocale = locale;
	}

	get locale() {
		return this.currentLocale;
	}

	set locale(value: string) {
		this.currentLocale = value;
	}

	addTranslations(locale: string, dict: Record<string, unknown>) {
		const existing = this.translations[locale] || {};

		const merge = (
			target: Record<string, unknown>,
			source: Record<string, unknown>
		): Record<string, unknown> => {
			const res = { ...target };
			for (const key of Object.keys(source)) {
				const sourceVal = source[key];
				const targetVal = target[key];
				if (sourceVal && typeof sourceVal === 'object' && !Array.isArray(sourceVal)) {
					const tVal =
						targetVal && typeof targetVal === 'object' && !Array.isArray(targetVal)
							? (targetVal as Record<string, unknown>)
							: {};
					res[key] = merge(tVal, sourceVal as Record<string, unknown>);
				} else {
					res[key] = sourceVal;
				}
			}
			return res;
		};

		this.translations[locale] = merge(existing, dict);
	}

	t(key: string, replacements?: Record<string, string | number>): string {
		const keys = key.split('.');
		let obj: unknown = this.translations[this.currentLocale];

		if (!obj) {
			// Tenta fallback para o primeiro idioma cadastrado
			const firstLang = Object.keys(this.translations)[0];
			if (firstLang) {
				obj = this.translations[firstLang];
			} else {
				return key;
			}
		}

		for (const k of keys) {
			if (obj && typeof obj === 'object' && k in obj) {
				obj = (obj as Record<string, unknown>)[k];
			} else {
				// Tenta buscar no fallback de outro idioma se não encontrar no atual
				const otherLangs = Object.keys(this.translations).filter((l) => l !== this.currentLocale);
				let foundFallback = false;
				for (const lang of otherLangs) {
					const fallbackObj = this.translations[lang];
					let val: unknown = fallbackObj;
					for (const fk of keys) {
						if (val && typeof val === 'object' && fk in val) {
							val = (val as Record<string, unknown>)[fk];
						} else {
							val = undefined;
							break;
						}
					}
					if (val !== undefined) {
						obj = val;
						foundFallback = true;
						break;
					}
				}
				if (!foundFallback) {
					return key;
				}
			}
		}

		if (obj === undefined || obj === null) {
			return key;
		}

		let text = String(obj);
		if (replacements) {
			for (const [k, v] of Object.entries(replacements)) {
				text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
			}
		}
		return text;
	}
}

export const i18n = new I18n();

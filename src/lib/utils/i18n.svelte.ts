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
			colorPicker: {
				triggerLabel: 'Seletor de cor. Cor atual: {color}',
				palette: 'Paleta de cores',
				customize: 'Personalizar...'
			},
			chips: {
				placeholder: 'Adicionar tag...',
				remove: 'Remover tag {tag}'
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
			multiSelect: {
				itemsSelected: '{count} selecionados'
			},
			loading: {
				message: 'Carregando...'
			},
			alert: {
				close: 'Fechar alerta'
			},
			input: {
				showPassword: 'Mostrar senha',
				hidePassword: 'Ocultar senha'
			},
			select: {
				placeholder: 'Selecione...'
			},
			search: {
				title: 'Buscar',
				placeholder: 'Buscar...',
				noResults: 'Nenhum resultado encontrado'
			},
			searchBar: {
				placeholder: 'Pesquisar...',
				clear: 'Limpar pesquisa'
			},
			quickActions: {
				open: 'Abrir ações'
			},
			tabs: {
				scrollLeft: 'Rolar abas para a esquerda',
				scrollRight: 'Rolar abas para a direita'
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
			colorPicker: {
				triggerLabel: 'Color picker. Current color: {color}',
				palette: 'Color palette',
				customize: 'Customize...'
			},
			chips: {
				placeholder: 'Add tag...',
				remove: 'Remove tag {tag}'
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
			multiSelect: {
				itemsSelected: '{count} selected'
			},
			loading: {
				message: 'Loading...'
			},
			alert: {
				close: 'Close alert'
			},
			input: {
				showPassword: 'Show password',
				hidePassword: 'Hide password'
			},
			select: {
				placeholder: 'Select...'
			},
			search: {
				title: 'Search',
				placeholder: 'Search...',
				noResults: 'No results found'
			},
			searchBar: {
				placeholder: 'Search...',
				clear: 'Clear search'
			},
			quickActions: {
				open: 'Open actions'
			},
			tabs: {
				scrollLeft: 'Scroll tabs left',
				scrollRight: 'Scroll tabs right'
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
			colorPicker: {
				triggerLabel: 'Selector de color. Color actual: {color}',
				palette: 'Paleta de colores',
				customize: 'Personalizar...'
			},
			chips: {
				placeholder: 'Agregar etiqueta...',
				remove: 'Eliminar etiqueta {tag}'
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
				filesSelected: '{count} archivos selecionados'
			},
			multiSelect: {
				itemsSelected: '{count} seleccionados'
			},
			loading: {
				message: 'Cargando...'
			},
			alert: {
				close: 'Cerrar alerta'
			},
			input: {
				showPassword: 'Mostrar contraseña',
				hidePassword: 'Ocultar contraseña'
			},
			select: {
				placeholder: 'Seleccione...'
			},
			search: {
				title: 'Buscar',
				placeholder: 'Buscar...',
				noResults: 'No se encontraron resultados'
			},
			searchBar: {
				placeholder: 'Buscar...',
				clear: 'Limpiar busqueda'
			},
			quickActions: {
				open: 'Abrir acciones'
			},
			tabs: {
				scrollLeft: 'Desplazar pestañas a la izquierda',
				scrollRight: 'Desplazar pestañas a la derecha'
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

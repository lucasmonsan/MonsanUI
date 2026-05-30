<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import '../lib/monsan-ui.css';

	// Component Imports
	import Button from '$lib/components/Button.svelte';
	import ThemeSelector from '$lib/components/ThemeSelector.svelte';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import Input from '$lib/components/Input.svelte';
	import Textarea from '$lib/components/Textarea.svelte';
	import Select from '$lib/components/Select.svelte';
	import Dialog from '$lib/components/Dialog.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import MediaDialog from '$lib/components/MediaDialog.svelte';
	import Search from '$lib/components/Search.svelte';
	import FlipCard from '$lib/components/FlipCard.svelte';
	import ExpandableCard from '$lib/components/ExpandableCard.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import Deck from '$lib/components/Deck.svelte';
	import Folders from '$lib/components/Folders.svelte';
	import CardEditor from '$lib/components/CardEditor.svelte';
	import Terminal, { type VFSNode } from '$lib/components/Terminal.svelte';
	import DndOrder from '$lib/components/DndOrder.svelte';
	import DndMatch from '$lib/components/DndMatch.svelte';
	import ActionBar from '$lib/components/ActionBar.svelte';
	import Calendar from '$lib/components/Calendar.svelte';
	import ToastComponent from '$lib/components/Toast.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import QuickActions from '$lib/components/QuickActions.svelte';
	import Credits from '$lib/components/Credits.svelte';
	import SplashScreen from '$lib/components/SplashScreen.svelte';
	import Text from '$lib/components/Text.svelte';

	// Novos Componentes
	import Checkbox from '$lib/components/Checkbox.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Radio from '$lib/components/Radio.svelte';
	import Range from '$lib/components/Range.svelte';
	import ColorPicker from '$lib/components/ColorPicker.svelte';
	import FileUpload from '$lib/components/FileUpload.svelte';
	import TimePicker from '$lib/components/TimePicker.svelte';
	import DatePicker from '$lib/components/DatePicker.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import Chips from '$lib/components/Chips.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import Separator from '$lib/components/Separator.svelte';

	// Icon Imports
	import BarChart from '$lib/components/icons/BarChart.svelte';
	import Check from '$lib/components/icons/Check.svelte';
	import ChevronDown from '$lib/components/icons/ChevronDown.svelte';
	import ChevronLeft from '$lib/components/icons/ChevronLeft.svelte';
	import ChevronUp from '$lib/components/icons/ChevronUp.svelte';
	import CircleAlert from '$lib/components/icons/CircleAlert.svelte';
	import Copy from '$lib/components/icons/Copy.svelte';
	import FileText from '$lib/components/icons/FileText.svelte';
	import FolderIcon from '$lib/components/icons/Folder.svelte';
	import GripVertical from '$lib/components/icons/GripVertical.svelte';
	import Lock from '$lib/components/icons/Lock.svelte';
	import LogOut from '$lib/components/icons/LogOut.svelte';
	import Microscope from '$lib/components/icons/Microscope.svelte';
	import Minus from '$lib/components/icons/Minus.svelte';
	import Pencil from '$lib/components/icons/Pencil.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
	import RotateCw from '$lib/components/icons/RotateCw.svelte';
	import SearchIcon from '$lib/components/icons/Search.svelte';
	import Settings from '$lib/components/icons/Settings.svelte';
	import SlidersHorizontal from '$lib/components/icons/SlidersHorizontal.svelte';
	import Sparkles from '$lib/components/icons/Sparkles.svelte';
	import Sun from '$lib/components/icons/Sun.svelte';
	import Trash from '$lib/components/icons/Trash.svelte';
	import TriangleAlert from '$lib/components/icons/TriangleAlert.svelte';
	import Unlock from '$lib/components/icons/Unlock.svelte';
	import User from '$lib/components/icons/User.svelte';
	import XIcon from '$lib/components/icons/X.svelte';
	import Zap from '$lib/components/icons/Zap.svelte';
	import Google from '$lib/components/icons/Google.svelte';
	import Github from '$lib/components/icons/Github.svelte';
	import Background from '$lib/components/Background.svelte';
	import SingleChoice from '$lib/components/questions/SingleChoice.svelte';
	import MultipleChoice from '$lib/components/questions/MultipleChoice.svelte';
	import { ptShowcase, enShowcase, esShowcase } from './showcase-translations.js';

	import type { Deck as DeckType, Folder, SearchResultItem, Toast } from '$lib/types.js';

	// Category tracking
	type Category = 'core' | 'forms' | 'overlays' | 'learning' | 'interactive' | 'questions' | 'data';
	let activeCategory = $state<Category>('core');

	// Active copy highlights
	let copiedIndex = $state<number | null>(null);

	const themeSelectorCode = `import ThemeSelector from '$lib/components/ThemeSelector.svelte';\n\n<!-- Padrão (2 temas - Light/Dark): cicla no clique -->\n<ThemeSelector />\n\n<!-- Customizado (3+ temas): abre menu dropdown -->\n<ThemeSelector\n\tthemes={[\n\t\t{ id: 'light', label: 'Claro' },\n\t\t{ id: 'dark', label: 'Escuro' },\n\t\t{ id: 'blue', label: 'Azul do Mar' }\n\t]}\n\tstorageKey="theme-custom"\n/>`;

	function copyToClipboard(text: string, index: number) {
		navigator.clipboard.writeText(text);
		copiedIndex = index;
		setTimeout(() => {
			if (copiedIndex === index) copiedIndex = null;
		}, 1500);
	}

	// Toast State
	let activeToasts = $state<Toast[]>([]);
	function addToast(message: string, type: Toast['type']) {
		const id = Math.random().toString(36).substring(2, 9);
		activeToasts = [...activeToasts, { id, message, type }];
		setTimeout(() => {
			activeToasts = activeToasts.filter((t) => t.id !== id);
		}, 3000);
	}

	// 1. Core State
	let buttonVariant = $state<'primary' | 'secondary' | 'success' | 'error' | 'neutral'>('primary');
	let buttonDisabled = $state(false);
	let buttonCount = $state(0);
	let currentLocale = $state('pt');

	// Tabs Showcase
	let demoActiveTab = $state('aba1');
	let demoTabsVariant = $state<'default' | 'underline'>('default');
	let demoTabsLog = $state('');
	$effect(() => {
		if (
			demoTabsLog === '' ||
			demoTabsLog === 'Nenhuma aba clicada' ||
			demoTabsLog === 'No tab clicked' ||
			demoTabsLog === 'Ninguna pestaña cliqueada'
		) {
			demoTabsLog =
				i18n.locale === 'pt'
					? 'Nenhuma aba clicada'
					: i18n.locale === 'en'
						? 'No tab clicked'
						: 'Ninguna pestaña cliqueada';
		}
	});
	let demoTabsScrollable = $state(false);
	let demoTabsNavButtons = $state(true);
	let demoTabsShowIcons = $state(false);

	let demoTabsItems = $derived([
		{
			id: 'aba1',
			label:
				i18n.locale === 'pt'
					? 'Aba de Exemplo 1'
					: i18n.locale === 'en'
						? 'Example Tab 1'
						: 'Pestaña de Ejemplo 1',
			icon: demoTabsShowIcons ? Sparkles : undefined
		},
		{
			id: 'aba2',
			label:
				i18n.locale === 'pt'
					? 'Aba de Exemplo 2'
					: i18n.locale === 'en'
						? 'Example Tab 2'
						: 'Pestaña de Ejemplo 2',
			icon: demoTabsShowIcons ? User : undefined
		},
		{
			id: 'aba3',
			label:
				i18n.locale === 'pt'
					? 'Aba de Exemplo 3'
					: i18n.locale === 'en'
						? 'Example Tab 3'
						: 'Pestaña de Ejemplo 3',
			icon: demoTabsShowIcons ? Settings : undefined
		},
		{
			id: 'aba4',
			label:
				i18n.locale === 'pt'
					? 'Aba de Exemplo 4'
					: i18n.locale === 'en'
						? 'Example Tab 4'
						: 'Pestaña de Ejemplo 4',
			icon: demoTabsShowIcons ? Sparkles : undefined
		},
		{
			id: 'aba5',
			label:
				i18n.locale === 'pt'
					? 'Aba de Exemplo 5'
					: i18n.locale === 'en'
						? 'Example Tab 5'
						: 'Pestaña de Ejemplo 5',
			icon: demoTabsShowIcons ? User : undefined
		},
		{
			id: 'aba6',
			label:
				i18n.locale === 'pt'
					? 'Aba de Exemplo 6'
					: i18n.locale === 'en'
						? 'Example Tab 6'
						: 'Pestaña de Ejemplo 6',
			icon: demoTabsShowIcons ? Settings : undefined
		},
		{
			id: 'aba7',
			label:
				i18n.locale === 'pt'
					? 'Aba de Exemplo 7'
					: i18n.locale === 'en'
						? 'Example Tab 7'
						: 'Pestaña de Ejemplo 7',
			icon: demoTabsShowIcons ? Sparkles : undefined
		},
		{
			id: 'aba8',
			label:
				i18n.locale === 'pt'
					? 'Aba de Exemplo 8'
					: i18n.locale === 'en'
						? 'Example Tab 8'
						: 'Pestaña de Ejemplo 8',
			icon: demoTabsShowIcons ? User : undefined
		}
	]);

	// Icons Showcase
	const allIcons = [
		{ name: 'BarChart', component: BarChart },
		{ name: 'Check', component: Check },
		{ name: 'ChevronDown', component: ChevronDown },
		{ name: 'ChevronLeft', component: ChevronLeft },
		{ name: 'ChevronUp', component: ChevronUp },
		{ name: 'CircleAlert', component: CircleAlert },
		{ name: 'Copy', component: Copy },
		{ name: 'FileText', component: FileText },
		{ name: 'Folder', component: FolderIcon },
		{ name: 'GripVertical', component: GripVertical },
		{ name: 'Lock', component: Lock },
		{ name: 'LogOut', component: LogOut },
		{ name: 'Microscope', component: Microscope },
		{ name: 'Minus', component: Minus },
		{ name: 'Pencil', component: Pencil },
		{ name: 'Plus', component: Plus },
		{ name: 'RotateCw', component: RotateCw },
		{ name: 'Search', component: SearchIcon },
		{ name: 'Settings', component: Settings },
		{ name: 'SlidersHorizontal', component: SlidersHorizontal },
		{ name: 'Sparkles', component: Sparkles },
		{ name: 'Sun', component: Sun },
		{ name: 'Trash', component: Trash },
		{ name: 'TriangleAlert', component: TriangleAlert },
		{ name: 'Unlock', component: Unlock },
		{ name: 'User', component: User },
		{ name: 'X', component: XIcon },
		{ name: 'Zap', component: Zap },
		{ name: 'Github', component: Github },
		{ name: 'Google', component: Google }
	];
	let selectedIconName = $state('Sparkles');
	let iconSizeKnob = $state(24);

	// 2. Forms State
	let inputValue = $state('Texto de exemplo');
	let inputSize = $state<'sm' | 'md'>('md');
	let inputType = $state<'text' | 'password'>('text');
	let inputPasswordToggle = $state(false);
	let textareaValue = $state('');
	let textareaSize = $state<'sm' | 'md'>('md');
	let selectValue = $state<string | number>('opt1');
	const selectOptions = $derived([
		{
			value: 'opt1',
			label: i18n.locale === 'pt' ? 'Opção 1' : i18n.locale === 'en' ? 'Option 1' : 'Opción 1'
		},
		{
			value: 'opt2',
			label: i18n.locale === 'pt' ? 'Opção 2' : i18n.locale === 'en' ? 'Option 2' : 'Opción 2'
		},
		{
			value: 'opt3',
			label: i18n.locale === 'pt' ? 'Opção 3' : i18n.locale === 'en' ? 'Option 3' : 'Opción 3'
		}
	]);

	// 3. Overlays State
	let isDialogSmOpen = $state(false);
	let isDialogMdOpen = $state(false);
	let isDialogLgOpen = $state(false);
	let dialogAnimation = $state<'pop' | 'slide' | 'fade' | 'scale'>('pop');
	let isConfirmOpen = $state(false);
	let confirmResult = $state<string>('Nenhuma ação realizada');
	let isMediaOpen = $state(false);
	let mediaType = $state<'image' | 'video' | 'audio' | 'youtube'>('image');
	let mediaUrl = $derived(
		mediaType === 'image'
			? '/showcase_illustration.png'
			: mediaType === 'youtube'
				? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
				: mediaType === 'video'
					? 'https://www.w3schools.com/html/mov_bbb.mp4'
					: 'https://www.w3schools.com/html/horse.mp3'
	);
	let isSearchOpen = $state(false);
	let searchResultText = $state('Nenhum item selecionado');

	let isFoldersDialogOpen = $state(false);
	let isFilterDialogOpen = $state(false);
	let activeFilter = $state<string>('todos');

	// Estados para novos componentes
	let checkboxVal = $state(false);
	let radioVal = $state('opcao1');
	let rangeVal = $state(50);
	let colorVal = $state('#c44933');
	let fileVal = $state<FileList | null>(null);
	let fileVariant = $state<'default' | 'invisible' | 'compact' | 'overlay'>('default');
	let fileInvisibleFiles = $state<FileList | null>(null);
	let timeVal = $state('12:30');
	let datePickerVal = $state<Date | null>(null);
	let searchBarVal = $state('');
	let chipsVal = $state(['Svelte', 'Neubrutalism']);

	let isDemoLoadingActive = $state(false);
	let demoLoadingMessage = $state('Carregando dados...');

	function triggerDemoLoading() {
		isDemoLoadingActive = true;
		setTimeout(() => {
			isDemoLoadingActive = false;
		}, 3000);
	}

	const mockSuggestions = [
		'Svelte 5',
		'SvelteKit',
		'TailwindCSS',
		'Neubrutalism Design',
		'MonsanUI Components',
		'TypeScript',
		'Vite'
	];

	const mockSearchItems: SearchResultItem[] = $derived([
		{
			id: '1',
			name:
				i18n.locale === 'pt'
					? 'Pasta de Desenvolvimento'
					: i18n.locale === 'en'
						? 'Development Folder'
						: 'Carpeta de Desarrollo',
			type: 'folder'
		},
		{
			id: '2',
			name:
				i18n.locale === 'pt'
					? 'Conjunto de Ativos SQL'
					: i18n.locale === 'en'
						? 'SQL Asset Pack'
						: 'Paquete de Activos SQL',
			type: 'deck'
		},
		{
			id: '3',
			name:
				i18n.locale === 'pt'
					? 'Guia de Estilo Geral'
					: i18n.locale === 'en'
						? 'General Style Guide'
						: 'Guía de Estilo General',
			type: 'deck'
		},
		{
			id: '4',
			name:
				i18n.locale === 'pt'
					? 'Pasta de Design System'
					: i18n.locale === 'en'
						? 'Design System Folder'
						: 'Carpeta de Design System',
			type: 'folder'
		}
	]);

	// Atalho de Teclado Global Ctrl + K
	$effect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				isSearchOpen = !isSearchOpen;
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	// Fechar todos os modais/popovers ao mudar de categoria
	$effect(() => {
		const category = activeCategory;
		if (category) {
			isDialogSmOpen = false;
			isDialogMdOpen = false;
			isDialogLgOpen = false;
			isConfirmOpen = false;
			isMediaOpen = false;
			isSearchOpen = false;
			isFoldersDialogOpen = false;
			isFilterDialogOpen = false;
			isDeckPopoverOpen = false;
			isDeckMenuOpen = false;
		}
	});

	// 4. Learning & Cards State
	let flashcardFlipped = $state(false);
	let flashcardSwipeResult = $state<string>('Nenhum swipe registrado');
	let flashcardFront = $state('Frente do Cartão (FlipCard)');
	let flashcardBack = $state('Verso do Cartão (Informação Oculta)');
	let flipCardOffset = $state({ x: 0, y: 0 });

	function handleFlipCardDrag(coords: { x: number; y: number }) {
		flipCardOffset = coords;
	}
	function handleFlipCardDragEnd() {
		flipCardOffset = { x: 0, y: 0 };
	}

	// ExpandableCard State
	let isExpandedDemo = $state(false);
	let expandOnSetting = $state<'card' | 'header' | 'indicator'>('card');
	let showChevronSetting = $state(true);
	let showTextSetting = $state(true);
	let indicatorTextSetting = $state('Ver Conteúdo');
	let indicatorTextExpandedSetting = $state('Ocultar Conteúdo');

	// DeckCard
	let mockDeck = $state<DeckType>({
		id: 'deck-vocab',
		name: 'Conjunto de Dados de Teste',
		theme: 'purple',
		cards: [
			{ id: 'c1', front: 'Frente 1', back: 'Verso 1', history: [] },
			{ id: 'c2', front: 'Frente 2', back: 'Verso 2', history: [] }
		]
	});
	let deckCardMessage = $state('Interaja com o DeckCard para ver eventos.');
	let isDeckPopoverOpen = $state(false);
	let isDeckMenuOpen = $state(false);

	// FoldersList
	let mockFolders = $state<Folder[]>([
		{ id: 'fold-1', name: 'Projetos', color: 'purple' },
		{ id: 'fold-2', name: 'Tecnologia', color: 'blue' },
		{ id: 'fold-3', name: 'Design', color: 'orange' }
	]);
	let activeFolderId = $state<string | null>(null);
	let foldersLayout = $state<'horizontal' | 'wrap' | 'grid'>('horizontal');
	let folderLog = $state('Nenhuma pasta selecionada');

	let foldersLabels = $derived({
		allFolders: i18n.locale === 'pt' ? 'Todas' : i18n.locale === 'en' ? 'All' : 'Todas',
		newFolder:
			i18n.locale === 'pt' ? 'Nova Pasta' : i18n.locale === 'en' ? 'New Folder' : 'Nueva Carpeta',
		editFolder:
			i18n.locale === 'pt'
				? 'Editar Pasta'
				: i18n.locale === 'en'
					? 'Edit Folder'
					: 'Editar Carpeta',
		folderNameLabel:
			i18n.locale === 'pt'
				? 'Nome da Pasta'
				: i18n.locale === 'en'
					? 'Folder Name'
					: 'Nombre de la Carpeta',
		folderNamePlaceholder:
			i18n.locale === 'pt'
				? 'Digite o nome...'
				: i18n.locale === 'en'
					? 'Enter name...'
					: 'Escriba el nombre...',
		folderColorLabel: i18n.locale === 'pt' ? 'Cor' : i18n.locale === 'en' ? 'Color' : 'Color',
		cancel: i18n.locale === 'pt' ? 'Cancelar' : i18n.locale === 'en' ? 'Cancel' : 'Cancelar',
		save: i18n.locale === 'pt' ? 'Salvar' : i18n.locale === 'en' ? 'Save' : 'Guardar',
		create: i18n.locale === 'pt' ? 'Criar' : i18n.locale === 'en' ? 'Create' : 'Crear',
		cannotDeleteAllFolder:
			i18n.locale === 'pt'
				? 'Não é possível excluir a pasta padrão'
				: i18n.locale === 'en'
					? 'Cannot delete the default folder'
					: 'No se puede eliminar la carpeta predeterminada',
		edit: i18n.locale === 'pt' ? 'Editar' : i18n.locale === 'en' ? 'Edit' : 'Editar',
		delete: i18n.locale === 'pt' ? 'Excluir' : i18n.locale === 'en' ? 'Delete' : 'Eliminar',
		options: i18n.locale === 'pt' ? 'Opções' : i18n.locale === 'en' ? 'Options' : 'Opciones'
	});

	$effect(() => {
		if (
			folderLog === 'Nenhuma pasta selecionada' ||
			folderLog === 'No folder selected' ||
			folderLog === 'Ninguna carpeta seleccionada'
		) {
			folderLog =
				i18n.locale === 'pt'
					? 'Nenhuma pasta selecionada'
					: i18n.locale === 'en'
						? 'No folder selected'
						: 'Ninguna carpeta seleccionada';
		}
	});

	$effect(() => {
		const currentLang = i18n.locale as 'pt' | 'en' | 'es';
		untrack(() => {
			mockFolders = mockFolders.map((f) => {
				if (f.id === 'fold-1') {
					const translations = { pt: 'Projetos', en: 'Projects', es: 'Proyectos' };
					if (f.name === 'Projetos' || f.name === 'Projects' || f.name === 'Proyectos') {
						return { ...f, name: translations[currentLang] || f.name };
					}
				} else if (f.id === 'fold-2') {
					const translations = { pt: 'Tecnologia', en: 'Technology', es: 'Tecnología' };
					if (f.name === 'Tecnologia' || f.name === 'Technology' || f.name === 'Tecnología') {
						return { ...f, name: translations[currentLang] || f.name };
					}
				} else if (f.id === 'fold-3') {
					const translations = { pt: 'Design', en: 'Design', es: 'Diseño' };
					if (f.name === 'Design' || f.name === 'Diseño') {
						return { ...f, name: translations[currentLang] || f.name };
					}
				}
				return f;
			});
		});
	});

	$effect(() => {
		if (
			confirmResult === 'Nenhuma ação realizada' ||
			confirmResult === 'No action performed' ||
			confirmResult === 'Ninguna acción realizada'
		) {
			confirmResult =
				i18n.locale === 'pt'
					? 'Nenhuma ação realizada'
					: i18n.locale === 'en'
						? 'No action performed'
						: 'Ninguna acción realizada';
		} else if (confirmResult === 'Confirmado' || confirmResult === 'Confirmed') {
			confirmResult =
				i18n.locale === 'pt' ? 'Confirmado' : i18n.locale === 'en' ? 'Confirmed' : 'Confirmado';
		} else if (confirmResult === 'Cancelado' || confirmResult === 'Cancelled') {
			confirmResult =
				i18n.locale === 'pt' ? 'Cancelado' : i18n.locale === 'en' ? 'Cancelled' : 'Cancelado';
		}
	});

	$effect(() => {
		if (
			searchResultText === 'Nenhum item selecionado' ||
			searchResultText === 'No item selected' ||
			searchResultText === 'Ningún elemento seleccionado'
		) {
			searchResultText =
				i18n.locale === 'pt'
					? 'Nenhum item selecionado'
					: i18n.locale === 'en'
						? 'No item selected'
						: 'Ningún elemento seleccionado';
		}
	});

	$effect(() => {
		if (
			flashcardSwipeResult === 'Arraste o cartão para ver o swipe' ||
			flashcardSwipeResult === 'Drag the card to see the swipe' ||
			flashcardSwipeResult === 'Arrastre la tarjeta para ver el deslizamiento'
		) {
			flashcardSwipeResult =
				i18n.locale === 'pt'
					? 'Arraste o cartão para ver o swipe'
					: i18n.locale === 'en'
						? 'Drag the card to see the swipe'
						: 'Arrastre la tarjeta para ver el deslizamiento';
		}
	});

	$effect(() => {
		if (
			deckCardMessage === 'Interaja com o DeckCard para ver eventos.' ||
			deckCardMessage === 'Interact with DeckCard to see events.' ||
			deckCardMessage === 'Interactúe con DeckCard para ver eventos.'
		) {
			deckCardMessage =
				i18n.locale === 'pt'
					? 'Interaja com o DeckCard para ver eventos.'
					: i18n.locale === 'en'
						? 'Interact with DeckCard to see events.'
						: 'Interactúe con DeckCard para ver eventos.';
		}
	});

	$effect(() => {
		if (
			cardEditorLog === 'Ordene e configure os cartões.' ||
			cardEditorLog === 'Sort and configure cards.' ||
			cardEditorLog === 'Ordene y configure las tarjetas.'
		) {
			cardEditorLog =
				i18n.locale === 'pt'
					? 'Ordene e configure os cartões.'
					: i18n.locale === 'en'
						? 'Sort and configure cards.'
						: 'Ordene y configure las tarjetas.';
		}
		if (
			cardEditorLog === 'Modifique os inputs e veja a sincronização.' ||
			cardEditorLog === 'Modify the inputs and see synchronization.' ||
			cardEditorLog === 'Modifique las entradas y vea la sincronización.'
		) {
			cardEditorLog =
				i18n.locale === 'pt'
					? 'Modifique os inputs e veja a sincronização.'
					: i18n.locale === 'en'
						? 'Modify the inputs and see synchronization.'
						: 'Modifique las entradas y vea la sincronización.';
		}
		if (
			cardEditorLog === 'Não é possível remover o único cartão restante.' ||
			cardEditorLog === 'Cannot remove the only remaining card.' ||
			cardEditorLog === 'No se puede eliminar la única tarjeta restante.'
		) {
			cardEditorLog =
				i18n.locale === 'pt'
					? 'Não é possível remover o único cartão restante.'
					: i18n.locale === 'en'
						? 'Cannot remove the only remaining card.'
						: 'No se puede eliminar la única tarjeta restante.';
		}
	});

	$effect(() => {
		if (
			mockDeck.name === 'Conjunto de Dados de Teste' ||
			mockDeck.name === 'Test Dataset' ||
			mockDeck.name === 'Conjunto de Datos de Prueba'
		) {
			mockDeck.name =
				i18n.locale === 'pt'
					? 'Conjunto de Dados de Teste'
					: i18n.locale === 'en'
						? 'Test Dataset'
						: 'Conjunto de Datos de Prueba';
		}
		if (mockDeck.cards[0].front === 'Frente 1' || mockDeck.cards[0].front === 'Front 1') {
			mockDeck.cards[0].front =
				i18n.locale === 'pt' ? 'Frente 1' : i18n.locale === 'en' ? 'Front 1' : 'Frente 1';
			mockDeck.cards[0].back =
				i18n.locale === 'pt' ? 'Verso 1' : i18n.locale === 'en' ? 'Back 1' : 'Reverso 1';
		}
		if (mockDeck.cards[1].front === 'Frente 2' || mockDeck.cards[1].front === 'Front 2') {
			mockDeck.cards[1].front =
				i18n.locale === 'pt' ? 'Frente 2' : i18n.locale === 'en' ? 'Front 2' : 'Frente 2';
			mockDeck.cards[1].back =
				i18n.locale === 'pt' ? 'Verso 2' : i18n.locale === 'en' ? 'Back 2' : 'Reverso 2';
		}

		if (
			indicatorTextSetting === 'Ver Conteúdo' ||
			indicatorTextSetting === 'View Content' ||
			indicatorTextSetting === 'Ver Contenido'
		) {
			indicatorTextSetting =
				i18n.locale === 'pt'
					? 'Ver Conteúdo'
					: i18n.locale === 'en'
						? 'View Content'
						: 'Ver Contenido';
		}
		if (
			indicatorTextExpandedSetting === 'Ocultar Conteúdo' ||
			indicatorTextExpandedSetting === 'Hide Content' ||
			indicatorTextExpandedSetting === 'Ocultar Contenido'
		) {
			indicatorTextExpandedSetting =
				i18n.locale === 'pt'
					? 'Ocultar Conteúdo'
					: i18n.locale === 'en'
						? 'Hide Content'
						: 'Ocultar Contenido';
		}
	});

	// CardEditorItem Interativo
	let nextCardId = 4;
	let editorCards = $state([
		{
			id: 'card-1',
			front: 'Elemento de Exemplo A',
			back: 'Informações detalhadas do elemento A',
			hint: 'Dica de contexto A',
			isHintVisible: true
		},
		{
			id: 'card-2',
			front: 'Elemento de Exemplo B',
			back: 'Informações detalhadas do elemento B',
			hint: 'Dica de contexto B',
			isHintVisible: false
		},
		{
			id: 'card-3',
			front: 'Elemento de Exemplo C',
			back: 'Informações detalhadas do elemento C',
			hint: 'Dica de contexto C',
			isHintVisible: true
		}
	]);
	let editorGridMode = $state(false);
	let cardEditorLog = $state('Modifique os inputs e veja a sincronização.');

	// Drag and Drop (DnD) em tempo real para CardEditorItem
	let draggedCardIndex = $state<number | null>(null);

	function handleCardDragStart(index: number) {
		draggedCardIndex = index;
		cardEditorLog =
			(i18n.locale === 'pt'
				? 'Arrastando cartão '
				: i18n.locale === 'en'
					? 'Dragging card '
					: 'Arrastrando tarjeta ') +
			(index + 1) +
			'...';
	}

	function handleCardDragOver(event: DragEvent, index: number) {
		event.preventDefault();
		if (draggedCardIndex === null || draggedCardIndex === index) return;

		const target =
			(event.currentTarget as HTMLElement) ||
			(event.target as HTMLElement).closest('.card-editor-item');
		if (target) {
			const rect = target.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;
			const cursorX = event.clientX;
			const cursorY = event.clientY;

			const draggingForward = draggedCardIndex < index;

			const passedVertical = draggingForward ? cursorY > centerY : cursorY < centerY;
			const passedHorizontal = draggingForward ? cursorX > centerX : cursorX < centerX;

			const cols = editorGridMode ? 2 : 1;
			const sameRow = Math.floor(draggedCardIndex / cols) === Math.floor(index / cols);
			const passed = sameRow ? passedHorizontal : passedVertical;

			if (passed) {
				const updated = [...editorCards];
				const [draggedCard] = updated.splice(draggedCardIndex, 1);
				updated.splice(index, 0, draggedCard);
				editorCards = updated;
				draggedCardIndex = index;
				cardEditorLog =
					(i18n.locale === 'pt'
						? 'Cartão arrastado para posição '
						: i18n.locale === 'en'
							? 'Card dragged to position '
							: 'Tarjeta arrastrada a la posición ') +
					(index + 1) +
					(i18n.locale === 'pt'
						? ' em tempo real.'
						: i18n.locale === 'en'
							? ' in real time.'
							: ' en tiempo real.');
			}
		}
	}

	function handleCardDragEnd() {
		draggedCardIndex = null;
	}

	function duplicateCard(index: number) {
		const cardToCopy = editorCards[index];
		const copy = {
			id: `card-${nextCardId++}`,
			front: `${cardToCopy.front} (${i18n.locale === 'pt' ? 'Cópia' : i18n.locale === 'en' ? 'Copy' : 'Copia'})`,
			back: cardToCopy.back,
			hint: cardToCopy.hint,
			isHintVisible: cardToCopy.isHintVisible
		};
		editorCards = [...editorCards.slice(0, index + 1), copy, ...editorCards.slice(index + 1)];
		cardEditorLog =
			(i18n.locale === 'pt' ? 'Card ' : i18n.locale === 'en' ? 'Card ' : 'Tarjeta ') +
			(index + 1) +
			(i18n.locale === 'pt'
				? ' duplicado com sucesso.'
				: i18n.locale === 'en'
					? ' successfully duplicated.'
					: ' duplicada con éxito.');
		addToast(
			i18n.locale === 'pt'
				? 'Cartão duplicado!'
				: i18n.locale === 'en'
					? 'Card duplicated!'
					: '¡Tarjeta duplicada!',
			'success'
		);
	}

	function removeCard(index: number) {
		if (editorCards.length <= 1) {
			addToast(
				i18n.locale === 'pt'
					? 'Você deve manter pelo menos um cartão.'
					: i18n.locale === 'en'
						? 'You must keep at least one card.'
						: 'Debe mantener al menos una tarjeta.',
				'warning'
			);
			cardEditorLog =
				i18n.locale === 'pt'
					? 'Não é possível remover o único cartão restante.'
					: i18n.locale === 'en'
						? 'Cannot remove the only remaining card.'
						: 'No se puede eliminar la única tarjeta restante.';
			return;
		}
		editorCards = editorCards.filter((_, idx) => idx !== index);
		cardEditorLog =
			(i18n.locale === 'pt' ? 'Card ' : i18n.locale === 'en' ? 'Card ' : 'Tarjeta ') +
			(index + 1) +
			(i18n.locale === 'pt' ? ' removido.' : i18n.locale === 'en' ? ' removed.' : ' eliminada.');
		addToast(
			i18n.locale === 'pt'
				? 'Cartão removido!'
				: i18n.locale === 'en'
					? 'Card removed!'
					: '¡Tarjeta eliminada!',
			'info'
		);
	}

	function moveCard(index: number, direction: -1 | 1) {
		const targetIndex = index + direction;
		if (targetIndex < 0 || targetIndex >= editorCards.length) return;
		const updated = [...editorCards];
		const temp = updated[index];
		updated[index] = updated[targetIndex];
		updated[targetIndex] = temp;
		editorCards = updated;
		cardEditorLog =
			(i18n.locale === 'pt' ? 'Card ' : i18n.locale === 'en' ? 'Card ' : 'Tarjeta ') +
			(index + 1) +
			(i18n.locale === 'pt'
				? ' movido para '
				: i18n.locale === 'en'
					? ' moved '
					: ' movida hacia ') +
			(direction === 1
				? i18n.locale === 'pt'
					? 'baixo'
					: i18n.locale === 'en'
						? 'down'
						: 'abajo'
				: i18n.locale === 'pt'
					? 'cima'
					: i18n.locale === 'en'
						? 'up'
						: 'arriba') +
			'.';
		addToast(
			i18n.locale === 'pt'
				? 'Cartão reordenado!'
				: i18n.locale === 'en'
					? 'Card reordered!'
					: '¡Tarjeta reordenada!',
			'info'
		);
	}

	// 5. Interactive State
	let terminalFilesystem = $state<Record<string, VFSNode>>({});
	const initialVFS = {
		home: {
			type: 'dir' as const,
			children: {
				lucas: {
					type: 'dir' as const,
					children: {
						'boas_vindas.txt': { type: 'file' as const },
						monsan: {
							type: 'dir' as const,
							children: {
								'config.json': { type: 'file' as const }
							}
						}
					}
				}
			}
		}
	};

	let dndOrderValue = $state<string[]>(['TypeScript', 'Svelte 5', 'Rust', 'Go']);
	let dndMatchValue = $state<Record<string, string[]>>({
		Frontend: [],
		Backend: []
	});
	const dndMatchOptions = ['React', 'NestJS', 'Svelte', 'PostgreSQL'];
	const dndMatchBuckets = ['Frontend', 'Backend'];

	let actionBarLog = $state('');
	$effect(() => {
		if (
			actionBarLog === '' ||
			actionBarLog === 'Nenhuma ação acionada na ActionBar' ||
			actionBarLog === 'No action triggered on ActionBar' ||
			actionBarLog === 'Ninguna acción activada en la ActionBar'
		) {
			actionBarLog =
				i18n.locale === 'pt'
					? 'Nenhuma ação acionada na ActionBar'
					: i18n.locale === 'en'
						? 'No action triggered on ActionBar'
						: 'Ninguna acción activada en la ActionBar';
		}
	});
	let actionBarItems = $derived([
		{
			id: 'folders',
			label: i18n.locale === 'pt' ? 'Pasta: ' : i18n.locale === 'en' ? 'Folder: ' : 'Carpeta: ',
			title:
				i18n.locale === 'pt'
					? 'Ver Pastas'
					: i18n.locale === 'en'
						? 'View Folders'
						: 'Ver Carpetas',
			icon: FolderIcon,
			folderTheme: 'purple',
			flex: 2,
			onclick: () => {
				actionBarLog =
					i18n.locale === 'pt'
						? 'Abrir Pastas clicado'
						: i18n.locale === 'en'
							? 'Open Folders clicked'
							: 'Abrir Carpetas cliqueado';
				addToast(actionBarLog, 'info');
				isFoldersDialogOpen = true;
			}
		},
		{
			id: 'filter',
			label: i18n.locale === 'pt' ? 'Filtrar' : i18n.locale === 'en' ? 'Filter' : 'Filtrar',
			icon: SlidersHorizontal,
			onclick: () => {
				actionBarLog =
					i18n.locale === 'pt'
						? 'Abrir Filtro clicado'
						: i18n.locale === 'en'
							? 'Open Filter clicked'
							: 'Abrir Filtro cliqueado';
				addToast(actionBarLog, 'info');
				isFilterDialogOpen = true;
			}
		},
		{
			id: 'search',
			label: i18n.locale === 'pt' ? 'Buscar' : i18n.locale === 'en' ? 'Search' : 'Buscar',
			title: i18n.locale === 'pt' ? 'Buscar' : i18n.locale === 'en' ? 'Search' : 'Buscar',
			icon: SearchIcon,
			onlyIcon: true,
			onclick: () => {
				actionBarLog =
					i18n.locale === 'pt'
						? 'Abrir Busca clicado'
						: i18n.locale === 'en'
							? 'Open Search clicked'
							: 'Abrir Búsqueda cliqueado';
				addToast(actionBarLog, 'info');
				isSearchOpen = true;
			}
		}
	]);

	// 6. Questions State
	let singleChoiceValue = $state<string | null>(null);
	let multipleChoiceValue = $state<string[]>([]);
	const choiceOptions = ['Svelte 5 Runes', 'Svelte 4 Store', 'React hooks', 'Vanilla JS'];
	let singleChoiceSize = $state<'sm' | 'md' | 'lg'>('lg');
	let singleChoiceColumns = $state<number>(1);
	let multipleChoiceSize = $state<'sm' | 'md' | 'lg'>('lg');
	let multipleChoiceColumns = $state<number>(1);

	// 7. Data State
	const today = new Date();
	const year = today.getFullYear();
	const monthVal = String(today.getMonth() + 1).padStart(2, '0');
	let studyLogs = $state<Record<string, number>>({
		[`${year}-${monthVal}-01`]: 2,
		[`${year}-${monthVal}-02`]: 5,
		[`${year}-${monthVal}-05`]: 1,
		[`${year}-${monthVal}-10`]: 8,
		[`${year}-${monthVal}-15`]: 12,
		[`${year}-${monthVal}-20`]: 4
	});
	let calendarEvents = $state<
		Record<
			string,
			{
				title: string;
				time?: string;
				description?: string;
				color?: 'default' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'red';
			}[]
		>
	>({
		[`${year}-${monthVal}-05`]: [
			{
				title: 'Revisão Geral',
				time: '14:00',
				description: 'Revisar os tópicos mais errados da semana',
				color: 'blue'
			}
		],
		[`${year}-${monthVal}-15`]: [
			{
				title: 'Exame Simulado',
				time: '09:00',
				description: 'Simulado completo MonsanUI',
				color: 'purple'
			},
			{
				title: 'Mentoria',
				time: '16:00',
				description: 'Reunião de feedback com o mentor',
				color: 'green'
			}
		]
	});
	let calendarMode = $state<'calendar' | 'heatmap'>('calendar');
	let calendarSelectedDate = $state<string | null>(null);
	let pageContainerMaxWidth = $state('var(--container-max-width)');
	let pageContainerPadding = $state('var(--space-md)');
	let panelInteractive = $state(false);
	let panelVariant = $state<'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'neutral'>(
		'primary'
	);
	let panelPadding = $state('var(--space-lg)');
	let panelMaxWidth = $state('512px');
	let creditsCopyright = $state('© 2026 Examster. Todos os direitos reservados.');
	let creditsVariant = $state<'default' | 'compact'>('default');
	let showSplashPreview = $state(false);

	let textTag = $state<
		'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'label' | 'small'
	>('p');
	let textFamily = $state<'body' | 'display'>('body');
	let textSize = $state<'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'>('md');
	let textWeight = $state<'normal' | 'medium' | 'semibold' | 'bold'>('normal');
	let textVariant = $state<'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'neutral'>(
		'primary'
	);

	let showFoldersCreateModal = $state(false);
	let dndOrderColumns = $state(1);

	import { i18n } from '$lib/utils/i18n.svelte';

	// Dicionários para internacionalização
	const pt = {
		header: {
			title: 'MonsanUI Showcase',
			description: 'Painel interativo de visualização de componentes da suite Monsan'
		},
		categories: {
			core: 'Core & Navegação',
			forms: 'Formulários & Inputs',
			overlays: 'Sobreposições & Diálogos',
			learning: 'Cards & Baralhos',
			interactive: 'Utilitários Interativos',
			questions: 'Perguntas (Questions)',
			data: 'Dados & Exibição'
		},
		...ptShowcase
	};

	const en = {
		header: {
			title: 'MonsanUI Showcase',
			description: 'Interactive dashboard for visualizing components of the Monsan suite'
		},
		categories: {
			core: 'Core & Navigation',
			forms: 'Forms & Inputs',
			overlays: 'Overlays & Dialogs',
			learning: 'Cards & Decks',
			interactive: 'Interactive Utilities',
			questions: 'Questions',
			data: 'Data & Displays'
		},
		...enShowcase
	};

	const es = {
		header: {
			title: 'MonsanUI Showcase',
			description: 'Panel interactivo para visualizar los componentes de la suite Monsan'
		},
		categories: {
			core: 'Core y Navegación',
			forms: 'Formularios e Inputs',
			overlays: 'Superposiciones y Diálogos',
			learning: 'Tarjetas y Barajas',
			interactive: 'Utilidades Interactivas',
			questions: 'Preguntas',
			data: 'Datos y Pantallas'
		},
		...esShowcase
	};

	// Registrar traduções
	i18n.addTranslations('pt', pt);
	i18n.addTranslations('en', en);
	i18n.addTranslations('es', es);

	// Sincronizar idioma reativamente com a classe singleton e atualizar tag HTML
	$effect(() => {
		i18n.locale = currentLocale;
		if (typeof document !== 'undefined') {
			document.documentElement.lang = currentLocale;
		}
	});

	// Persistência da categoria ativa e scroll ao topo suave
	let isMounted = $state(false);
	onMount(() => {
		const saved = localStorage.getItem('monsan-active-category');
		if (saved) {
			activeCategory = saved as Category;
		}
		isMounted = true;
	});

	$effect(() => {
		if (activeCategory) {
			localStorage.setItem('monsan-active-category', activeCategory);
			if (isMounted) {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
		}
	});

	// Background switcher estados
	let globalBgPattern = $state<'grid' | 'dots' | 'diagonal' | 'lines' | 'horizontal'>('grid');
	let globalBgAnimate = $state(true);
	let globalBgDirection = $state<
		'up' | 'down' | 'left' | 'right' | 'diagonal' | 'diagonal-reverse'
	>('diagonal');

	// Local background grid estados
	let localBgPattern = $state<'grid' | 'dots' | 'diagonal' | 'lines' | 'horizontal'>('grid');
	let localBgAnimate = $state(true);
	let localBgDirection = $state<'up' | 'down' | 'left' | 'right' | 'diagonal' | 'diagonal-reverse'>(
		'diagonal'
	);

	// New components showcase states
	let alertType = $state<'success' | 'error' | 'warning' | 'info'>('info');
	let alertDismissible = $state(true);
	let alertShowIcon = $state(true);
	let alertTitle = $state('Notificação Importante');
	let isAlertActive = $state(true);

	let progressValue = $state(45);
	let progressVariant = $state<'primary' | 'success' | 'warning' | 'error' | 'info'>('primary');
	let progressStriped = $state(true);
	let progressAnimated = $state(true);

	let avatarSize = $state<'sm' | 'md' | 'lg'>('md');
	let avatarShape = $state<'circle' | 'square'>('circle');
	let avatarName = $state('Lucas Monsan');
	let avatarSrc = $state(
		'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'
	);

	let alertCode = $derived(
		`import Alert from '$lib/components/Alert.svelte';\n\n` +
			`<Alert type="${alertType}" title="${alertTitle}" dismissible={${alertDismissible}} showIcon={${alertShowIcon}}>\n` +
			`\tEsta é uma mensagem explicativa do alerta.\n` +
			`</Alert>`
	);

	let progressCode = $derived(
		`import ProgressBar from '$lib/components/ProgressBar.svelte';\n\n` +
			`<ProgressBar value={${progressValue}} variant="${progressVariant}" striped={${progressStriped}} animated={${progressAnimated}} showLabel={true} />`
	);

	let avatarCode = $derived(
		`import Avatar from '$lib/components/Avatar.svelte';\n\n` +
			`<Avatar src="${avatarSrc}" name="${avatarName}" size="${avatarSize}" shape="${avatarShape}" />`
	);

	// New Knobs states
	let buttonShowIcon = $state(false);
	let quickActionsRevealMode = $state<'icon-only' | 'text-icon'>('text-icon');
	let dndOrderShowNumbers = $state(true);
	let isScrolled = $state(false);

	// Dynamic Code Box Previews (Svelte 5 Derived)
	let buttonCode = $derived(
		`import Button from '$lib/components/Button.svelte';` +
			(buttonShowIcon ? `\nimport Sparkles from '$lib/components/icons/Sparkles.svelte';` : '') +
			`\n\n<Button variant="${buttonVariant}" disabled={${buttonDisabled}} onclick={handleClick}>\n` +
			(buttonShowIcon ? `\t<Sparkles size={16} />\n` : '') +
			`\tClique aqui\n</Button>`
	);

	let tabsCode = $derived(
		`import Tabs from '$lib/components/Tabs.svelte';` +
			(demoTabsShowIcons
				? `\nimport Sparkles from '$lib/components/icons/Sparkles.svelte';\nimport User from '$lib/components/icons/User.svelte';\nimport Settings from '$lib/components/icons/Settings.svelte';`
				: '') +
			`\n\n<Tabs\n` +
			`\tbind:value={activeTab}\n` +
			`\titems={[\n` +
			`\t\t{ id: 'tab1', label: 'Aba 1'${demoTabsShowIcons ? ', icon: Sparkles' : ''} },\n` +
			`\t\t{ id: 'tab2', label: 'Aba 2'${demoTabsShowIcons ? ', icon: User' : ''} },\n` +
			`\t\t{ id: 'tab3', label: 'Aba 3'${demoTabsShowIcons ? ', icon: Settings' : ''} }\n` +
			`\t]}\n` +
			(demoTabsVariant !== 'default' ? `\tvariant="${demoTabsVariant}"\n` : '') +
			(demoTabsScrollable ? `\tscrollable={true}\n` : '') +
			(demoTabsScrollable && !demoTabsNavButtons ? `\tshowNavButtons={false}\n` : '') +
			`/>`
	);

	let inputCode = $derived(
		`import Input from '$lib/components/Input.svelte';\n\n<Input\n\tsize="${inputSize}"\n\ttype="${inputType}"\n\tbind:value={value}\n` +
			(inputType === 'password' ? `\tshowPasswordToggle={${inputPasswordToggle}}\n` : '') +
			`\tplaceholder="${inputType === 'password' ? 'Digite sua senha...' : 'Digite seu texto...'}"\n/>`
	);

	let checkboxCode = $derived(
		`import Checkbox from '$lib/components/Checkbox.svelte';\n\n<Checkbox bind:checked={checked} label="Aceito os termos" />`
	);

	let radioCode = $derived(
		`import Radio from '$lib/components/Radio.svelte';\n\n<!-- No grupo -->\n<Radio bind:group={radioGroup} value="opcao1" label="Opção A" />\n<Radio bind:group={radioGroup} value="opcao2" label="Opção B" />`
	);

	let rangeCode = $derived(
		`import Range from '$lib/components/Range.svelte';\n\n<Range bind:value={rangeVal} min={0} max={100} step={1} />`
	);

	let colorCode = $derived(
		`import ColorPicker from '$lib/components/ColorPicker.svelte';\n\n<ColorPicker bind:value={colorVal} />`
	);

	let fileCode = $derived(
		fileVariant === 'invisible'
			? `import FileUpload from '$lib/components/FileUpload.svelte';\n\nlet files = $state(null);\n\n<FileUpload variant="invisible" bind:files={files} multiple={true}>\n  {#snippet trigger({ open })}\n    <button onclick={open}>Escolher arquivo</button>\n  {/snippet}\n</FileUpload>`
			: fileVariant === 'compact'
				? `import FileUpload from '$lib/components/FileUpload.svelte';\n\nlet files = $state(null);\n\n<FileUpload\n  variant="compact"\n  bind:files={files}\n  multiple={true}\n  buttonLabel="Escolher arquivo"\n/>`
				: fileVariant === 'overlay'
					? `import FileUpload from '$lib/components/FileUpload.svelte';\n\nlet files = $state(null);\n\n<!-- Escuta drag na window inteira -->\n<FileUpload\n  variant="overlay"\n  bind:files={files}\n  multiple={true}\n  placeholder="Arraste arquivos para qualquer lugar da página"\n  buttonLabel="Ou clique aqui"\n/>`
					: `import FileUpload from '$lib/components/FileUpload.svelte';\n\nlet files = $state(null);\n\n<FileUpload bind:files={files} multiple={true} placeholder="Arraste arquivos aqui..." />`
	);

	let timeCode = $derived(
		`import TimePicker from '$lib/components/TimePicker.svelte';\n\n<TimePicker bind:value={timeVal} />`
	);

	let datePickerCode = $derived(
		`import DatePicker from '$lib/components/DatePicker.svelte';\n\n<DatePicker bind:value={dateValue} placeholder="Selecione uma data" />`
	);

	let loadingCode = $derived(
		`import Loading from '$lib/components/Loading.svelte';\n\n` +
			`<Loading active={isLoadingActive} message="${demoLoadingMessage}" />`
	);

	let searchBarCode = $derived(
		`import SearchBar from '$lib/components/SearchBar.svelte';\n\n<SearchBar bind:value={searchValue} suggestions={['Svelte', 'TypeScript', 'Vite']} />`
	);

	let chipsCode = $derived(
		`import Chips from '$lib/components/Chips.svelte';\n\n<Chips bind:value={tags} placeholder="Adicionar tag..." />`
	);

	let textareaCode = $derived(
		`import Textarea from '$lib/components/Textarea.svelte';\n\n<Textarea size="${textareaSize}" bind:value={value} placeholder="Mensagem..." />`
	);

	let expandableCardCode = $derived(
		`import ExpandableCard from '$lib/components/ExpandableCard.svelte';\n\n<ExpandableCard\n\tbind:expanded={isExpanded}\n\ttitle="Título do Card"\n\texpandOn="${expandOnSetting}"\n\tindicatorText="${indicatorTextSetting}"\n\tindicatorTextExpanded="${indicatorTextExpandedSetting}"\n>\n\t<p>Conteúdo interno expansível</p>\n</ExpandableCard>`
	);

	let deckCodeString = $derived(
		`import Deck from '$lib/components/Deck.svelte';\n\n<Deck\n\tdeck={deck}\n\tindex={0}\n\tfolderColor="${mockDeck.theme}"\n\tstats={{ newCount: 3, dueCount: 14 }}\n\tonSelect={handleSelect}\n\tonStartSession={handleStart}\n/>`
	);

	let foldersCode = $derived(
		`import Folders from '$lib/components/Folders.svelte';\n\n<Folders layout="${foldersLayout}" items={folders} />`
	);

	let cardEditorCode = $derived(
		`import CardEditor from '$lib/components/CardEditor.svelte';\n\n{#each cards as card, idx (card.id)}\n\t<CardEditor\n\t\tbind:value={cards[idx]}\n\t\tindex={idx}\n\t\ttotalCards={cards.length}\n\t\tonMove={moveCard}\n\t\tonDuplicate={duplicateCard}\n\t\tonRemove={removeCard}\n\t\tisDragging={draggedIndex === idx}\n\t\tonDragStart={handleDragStart}\n\t\tonDragOver={handleDragOver}\n\t\tonDragEnd={handleDragEnd}\n\t/>\n{/each}`
	);

	let dndOrderCode = $derived(
		`import DndOrder from '$lib/components/DndOrder.svelte';\n\n<DndOrder options={['TypeScript', 'Svelte 5', 'Rust', 'Go']} bind:value={orderedList} columns={${dndOrderColumns}} showNumbers={${dndOrderShowNumbers}} />`
	);

	let flipCardCode = $derived(
		`import FlipCard from '$lib/components/FlipCard.svelte';\n\n<FlipCard bind:flipped={${flashcardFlipped}} onswipe={handleSwipe}>\n\t{#snippet front()}\n\t\t<p>Frente</p>\n\t{/snippet}\n\t{#snippet back()}\n\t\t<p>Verso</p>\n\t{/snippet}\n</FlipCard>`
	);

	let quickActionsCode = $derived(
		`import QuickActions from '$lib/components/QuickActions.svelte';` +
			(quickActionsRevealMode === 'icon-only'
				? `\nimport Pencil from '$lib/components/icons/Pencil.svelte';\nimport Trash from '$lib/components/icons/Trash.svelte';`
				: '') +
			`\n\n<!-- Variante Dropdown -->\n<QuickActions variant="dropdown" width="max-content">\n\t{#snippet trigger()}\n\t\t<Button size="sm">Opções</Button>\n\t{/snippet}\n\t<button class="dropdown-item">Configurações</button>\n\t<button class="dropdown-item">Ajuda</button>\n</QuickActions>\n\n<!-- Variante Reveal (Gatilho inline) -->\n<QuickActions variant="reveal" width="80%">\n\t{#snippet trigger()}\n\t\t<button class="btn-icon">⚙️</button>\n\t{/snippet}\n\t<div class="actions-row">\n\t\t<Button size="sm" onclick={edit}>\n\t\t\t<Pencil size={16} />` +
			(quickActionsRevealMode === 'text-icon' ? ` Edição` : '') +
			`\n\t\t</Button>\n\t\t<Button size="sm" class="btn-delete" onclick={remove}>\n\t\t\t<Trash size={16} />` +
			(quickActionsRevealMode === 'text-icon' ? ` Lixo` : '') +
			`\n\t\t</Button>\n\t</div>\n</QuickActions>`
	);

	let calendarCode = $derived(
		`import Calendar from '$lib/components/Calendar.svelte';\n\n<Calendar mode="${calendarMode}" />`
	);

	let panelCode = $derived(
		`import Panel from '$lib/components/Panel.svelte';\n\n` +
			`<Panel variant="${panelVariant}" padding="${panelPadding}" maxWidth="${panelMaxWidth}"${panelInteractive ? ' interactive' : ''}>\n` +
			`  <div>\n` +
			`    <h4>Título do Painel</h4>\n` +
			`    <p>Conteúdo interno...</p>\n` +
			`  </div>\n` +
			`</Panel>`
	);

	let textCode = $derived(
		`import Text from '$lib/components/Text.svelte';\n\n` +
			`<Text tag="${textTag}" family="${textFamily}" size="${textSize}" weight="${textWeight}" variant="${textVariant}">\n` +
			`  Texto tipográfico neubrutalista...\n` +
			`</Text>`
	);

	let creditsCode = $derived(
		`import Credits from '$lib/components/Credits.svelte';\n\n` +
			`<Credits\n` +
			`  authorName="MonsanUI"\n` +
			`  authorLink="https://github.com/lucasmonsan"\n` +
			(creditsCopyright ? `  copyright="${creditsCopyright}"\n` : '') +
			(creditsVariant !== 'default' ? `  variant="${creditsVariant}"\n` : '') +
			`/>`
	);

	let splashScreenCode = $derived(
		`import SplashScreen from '$lib/components/SplashScreen.svelte';\n\n` +
			`<SplashScreen\n` +
			`  appName="Meu App"\n` +
			`  logoSrc="/favicon.svg"\n` +
			`  sessionKey="meu-app-splash-shown"\n` +
			`  copyright="© 2026 Meu App"\n` +
			(creditsVariant !== 'default' ? `  creditsVariant="${creditsVariant}"\n` : '') +
			`/>`
	);

	let pageContainerCode = $derived(
		`import PageContainer from '$lib/components/PageContainer.svelte';\n\n` +
			`<PageContainer maxWidth="${pageContainerMaxWidth}" padding="${pageContainerPadding}">\n` +
			`  <div>Conteúdo da Página</div>\n` +
			`</PageContainer>`
	);
</script>

<svelte:head>
	<title>MonsanUI - Showcase</title>
	<meta name="description" content={i18n.t('header.description')} />
	<meta property="og:title" content="MonsanUI - Showcase" />
	<meta property="og:description" content={i18n.t('header.description')} />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="MonsanUI - Showcase" />
	<meta name="twitter:description" content={i18n.t('header.description')} />
</svelte:head>

<Background pattern={globalBgPattern} animate={globalBgAnimate} direction={globalBgDirection} />

<div class="toast-container">
	{#each activeToasts as toast (toast.id)}
		<ToastComponent {toast} />
	{/each}
</div>

<main class="showcase-container">
	<div class="showcase-top-bar" class:is-scrolled={isScrolled}>
		<header class="showcase-header panel">
			<div class="header-left">
				<h1>{i18n.t('header.title')}</h1>
				<p>{i18n.t('header.description')}</p>
			</div>
			<div class="header-right">
				<div class="category-navigation-header">
					<Select
						bind:value={activeCategory}
						options={[
							{ value: 'core', label: i18n.t('categories.core') },
							{ value: 'forms', label: i18n.t('categories.forms') },
							{ value: 'overlays', label: i18n.t('categories.overlays') },
							{ value: 'learning', label: i18n.t('categories.learning') },
							{ value: 'interactive', label: i18n.t('categories.interactive') },
							{ value: 'questions', label: i18n.t('categories.questions') },
							{ value: 'data', label: i18n.t('categories.data') }
						]}
						placeholder="Menu..."
					/>
				</div>
				<ThemeSelector />

				<LanguageSelector
					value={currentLocale}
					locales={[
						{ id: 'pt', label: 'PT', name: 'Português' },
						{ id: 'en', label: 'EN', name: 'English' },
						{ id: 'es', label: 'ES', name: 'Español' }
					]}
					onChange={(loc: string) => {
						currentLocale = loc;
						addToast(i18n.t('bgSwitcher.toast_lang') + loc.toUpperCase(), 'info');
					}}
				/>
			</div>
		</header>
	</div>

	<div
		class="showcase-scroll-container"
		onscroll={(e) => {
			const target = e.currentTarget;
			isScrolled = target.scrollTop > 10;
		}}
	>
		<div class="showcase-layout">
			<!-- Main Showcase Content -->
			<section class="main-content">
				{#if activeCategory === 'core'}
					<h2 class="category-title">{i18n.t('categories.core')}</h2>

					<!-- Button Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Button</h3>
							<p>{i18n.t('button.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render">
									<Button
										variant={buttonVariant}
										disabled={buttonDisabled}
										onclick={() => {
											buttonCount++;
											addToast(
												`${i18n.locale === 'pt' ? 'Cliques' : i18n.locale === 'en' ? 'Clicks' : 'Clics'}: ${buttonCount}`,
												'success'
											);
										}}
									>
										{#if buttonShowIcon}
											<Sparkles size={16} style="margin-right: 6px;" />
										{/if}
										{i18n.t('button.click_here')} ({buttonCount})
									</Button>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="btn-variant">{i18n.t('knobs.variant')}</label>
										<select id="btn-variant" bind:value={buttonVariant} class="select-knob">
											<option value="primary">primary</option>
											<option value="secondary">secondary</option>
											<option value="success">success</option>
											<option value="error">error</option>
											<option value="neutral">neutral</option>
										</select>
									</div>
									<div class="knob-row">
										<label for="btn-disabled">{i18n.t('knobs.disabled_simple')}</label>
										<input type="checkbox" id="btn-disabled" bind:checked={buttonDisabled} />
									</div>
									<div class="knob-row">
										<label for="btn-icon">{i18n.t('knobs.show_icon')}</label>
										<input type="checkbox" id="btn-icon" bind:checked={buttonShowIcon} />
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(buttonCode, 1)}>
									{copiedIndex === 1 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{buttonCode}</code></pre>
						</div>
					</div>

					<!-- ThemeSelector Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>ThemeSelector</h3>
							<p>{i18n.t('themeToggle.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="preview-render"
									style="display: flex; flex-direction: column; gap: var(--space-md); align-items: flex-start; justify-content: center; min-height: 120px; padding: var(--space-md);"
								>
									<div style="display: flex; align-items: center; gap: var(--space-md);">
										<span style="font-weight: 700; font-size: var(--text-sm);"
											>{i18n.locale === 'pt'
												? '1. Padrão (2 temas - Clicar para alternar):'
												: i18n.locale === 'en'
													? '1. Default (2 themes - Click to toggle):'
													: '1. Estándar (2 temas - Clicar para alternar):'}</span
										>
										<ThemeSelector />
									</div>
									<div style="display: flex; align-items: center; gap: var(--space-md);">
										<span style="font-weight: 700; font-size: var(--text-sm);"
											>{i18n.locale === 'pt'
												? '2. Customizado (3 temas - Menu Dropdown):'
												: i18n.locale === 'en'
													? '2. Customized (3 themes - Dropdown Menu):'
													: '2. Personalizado (3 temas - Menú Desplegable):'}</span
										>
										<ThemeSelector
											themes={[
												{
													id: 'light',
													label:
														i18n.locale === 'pt'
															? 'Claro'
															: i18n.locale === 'en'
																? 'Light'
																: 'Claro'
												},
												{
													id: 'dark',
													label:
														i18n.locale === 'pt'
															? 'Escuro'
															: i18n.locale === 'en'
																? 'Dark'
																: 'Oscuro'
												},
												{
													id: 'blue',
													label:
														i18n.locale === 'pt'
															? 'Azul do Mar'
															: i18n.locale === 'en'
																? 'Sea Blue'
																: 'Azul del Mar'
												}
											]}
											storageKey="theme-demo-custom"
										/>
									</div>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div
									class="knobs-content"
									style="font-size: var(--text-sm); line-height: 1.5; color: var(--text-secondary); display: flex; flex-direction: column; gap: var(--space-xs);"
								>
									<p>{i18n.t('knobs.theme_desc')}</p>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(themeSelectorCode, 2)}>
									{copiedIndex === 2 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{themeSelectorCode}</code></pre>
						</div>
					</div>

					<!-- LanguageSelector Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>LanguageSelector</h3>
							<p>
								{i18n.t('localeSwitcher.description')}
							</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="preview-render"
									style="display: flex; flex-direction: column; gap: var(--space-md); align-items: flex-start; justify-content: center; min-height: 120px; padding: var(--space-md);"
								>
									<div style="display: flex; align-items: center; gap: var(--space-md);">
										<span style="font-weight: 700; font-size: var(--text-sm);"
											>{i18n.locale === 'pt'
												? '1. Padrão (2 idiomas - Cicla no clique):'
												: i18n.locale === 'en'
													? '1. Default (2 languages - Cycle on click):'
													: '1. Estándar (2 idiomas - Ciclo en clic):'}</span
										>
										<LanguageSelector
											value={currentLocale === 'es' ? 'en' : currentLocale}
											onChange={(loc) => {
												currentLocale = loc;
												addToast(
													`${i18n.locale === 'pt' ? 'Idioma' : i18n.locale === 'en' ? 'Language' : 'Idioma'}: ${loc.toUpperCase()}`,
													'info'
												);
											}}
										/>
									</div>
									<div style="display: flex; align-items: center; gap: var(--space-md);">
										<span style="font-weight: 700; font-size: var(--text-sm);"
											>{i18n.locale === 'pt'
												? '2. Customizado (3 idiomas - Menu Dropdown):'
												: i18n.locale === 'en'
													? '2. Customized (3 languages - Dropdown Menu):'
													: '2. Personalizado (3 idiomas - Menú Desplegable):'}</span
										>
										<LanguageSelector
											bind:value={currentLocale}
											locales={[
												{ id: 'pt', label: 'PT', name: 'Português' },
												{ id: 'en', label: 'EN', name: 'English' },
												{ id: 'es', label: 'ES', name: 'Español' }
											]}
											onChange={(loc) => {
												addToast(
													`${i18n.locale === 'pt' ? 'Idioma' : i18n.locale === 'en' ? 'Language' : 'Idioma'}: ${loc.toUpperCase()}`,
													'info'
												);
											}}
										/>
									</div>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Idioma Ativo:'
												: i18n.locale === 'en'
													? 'Active Language:'
													: 'Idioma Activo:'}</span
										>
										<span class="status-badge">{currentLocale.toUpperCase()}</span>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button
									onclick={() =>
										copyToClipboard(
											`import LanguageSelector from '$lib/components/LanguageSelector.svelte';\n\n<!-- 2 idiomas: cicla -->\n<LanguageSelector value="${currentLocale}" onChange={(loc) => currentLocale = loc} />\n\n<!-- 3+ idiomas: dropdown -->\n<LanguageSelector\n\tbind:value={currentLocale}\n\tlocales={[\n\t\t{ id: 'pt', label: 'PT', name: 'Português' },\n\t\t{ id: 'en', label: 'EN', name: 'English' },\n\t\t{ id: 'es', label: 'ES', name: 'Español' }\n\t]}\n/>`,
											3
										)}
								>
									{copiedIndex === 3 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code
									>{`import LanguageSelector from '$lib/components/LanguageSelector.svelte';\n\n<!-- 2 idiomas: cicla -->\n<LanguageSelector value="${currentLocale}" onChange={(loc) => currentLocale = loc} />\n\n<!-- 3+ idiomas: dropdown -->\n<LanguageSelector\n\tbind:value={currentLocale}\n\tlocales={[\n\t\t{ id: 'pt', label: 'PT', name: 'Português' },\n\t\t{ id: 'en', label: 'EN', name: 'English' },\n\t\t{ id: 'es', label: 'ES', name: 'Español' }\n\t]}\n/>`}</code
								></pre>
						</div>
					</div>

					<!-- ActionBar Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>ActionBar</h3>
							<p>
								{i18n.t('actionBar.description')}
							</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render">
									<ActionBar items={actionBarItems} />
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.docs')}</span>
								<div
									class="knobs-content"
									style="gap: var(--space-md); display: flex; flex-direction: column;"
								>
									<div class="log-output">{actionBarLog}</div>
									<div
										style="font-size: var(--text-sm); line-height: 1.5; color: var(--text-secondary); display: flex; flex-direction: column; gap: var(--space-xs);"
									>
										<div class="knobs-help">
											<p>{i18n.t('knobs.action_bar_desc')}</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button
									onclick={() =>
										copyToClipboard(
											`import ActionBar from '$lib/components/ActionBar.svelte';\nimport FolderIcon from '$lib/components/icons/Folder.svelte';\n\nlet items = [\n\t{ id: 'folders', label: 'Pastas', icon: FolderIcon, flex: 2, onclick: handleOpen }\n];\n\n<ActionBar {items} />`,
											5
										)}
								>
									{copiedIndex === 5 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code
									>{`import ActionBar from '$lib/components/ActionBar.svelte';\nimport FolderIcon from '$lib/components/icons/Folder.svelte';\n\nlet items = [\n\t{ id: 'folders', label: 'Pastas', icon: FolderIcon, flex: 2, onclick: handleOpen }\n];\n\n<ActionBar {items} />`}</code
								></pre>
						</div>
					</div>

					<!-- Tabs Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Tabs</h3>
							<p>{i18n.t('tabs.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="preview-render full-width-render"
									style="padding: var(--space-md); flex-direction: column; align-items: stretch;"
								>
									<Tabs
										bind:value={demoActiveTab}
										items={demoTabsItems}
										variant={demoTabsVariant}
										scrollable={demoTabsScrollable}
										showNavButtons={demoTabsNavButtons}
										wrap={!demoTabsScrollable}
										onchange={(id) => {
											const tabNum = id.replace('aba', '').replace('tab', '');
											demoTabsLog =
												i18n.locale === 'pt'
													? `Aba de Exemplo ${tabNum} ativa`
													: i18n.locale === 'en'
														? `Example Tab ${tabNum} active`
														: `Pestaña de Ejemplo ${tabNum} activa`;
											addToast(
												i18n.locale === 'pt'
													? `Aba ${tabNum} selecionada!`
													: i18n.locale === 'en'
														? `Tab ${tabNum} selected!`
														: `¡Pestaña ${tabNum} seleccionada!`,
												'info'
											);
										}}
									/>
									<div
										style="margin-top: var(--space-md); padding: var(--space-md); background: var(--bg-secondary); border: var(--border-width) dashed var(--border-color); border-radius: var(--radius-sm); text-align: center; font-family: var(--font-display); font-weight: 700;"
									>
										{i18n.t('common.active_content')}
										<span style="color: var(--accent-primary);">{demoActiveTab.toUpperCase()}</span>
									</div>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div
									class="knobs-content"
									style="gap: var(--space-md); display: flex; flex-direction: column;"
								>
									<div class="knob-row">
										<label for="tabs-variant">{i18n.t('knobs.variant')}</label>
										<select id="tabs-variant" bind:value={demoTabsVariant} class="select-knob">
											<option value="default">Default</option>
											<option value="underline">Underline</option>
										</select>
									</div>
									<div class="knob-row">
										<label for="tabs-scrollable">{i18n.t('knobs.horizontal_scroll')}</label>
										<input type="checkbox" id="tabs-scrollable" bind:checked={demoTabsScrollable} />
									</div>
									{#if demoTabsScrollable}
										<div class="knob-row">
											<label for="tabs-nav-buttons">{i18n.t('knobs.show_nav_buttons')}</label>
											<input
												type="checkbox"
												id="tabs-nav-buttons"
												bind:checked={demoTabsNavButtons}
											/>
										</div>
									{/if}
									<div class="knob-row">
										<label for="tabs-show-icons">{i18n.t('knobs.show_icon')}</label>
										<input type="checkbox" id="tabs-show-icons" bind:checked={demoTabsShowIcons} />
									</div>
									<div class="log-output">{demoTabsLog}</div>
									<div
										style="font-size: var(--text-sm); line-height: 1.5; color: var(--text-secondary); display: flex; flex-direction: column; gap: var(--space-xs);"
									>
										<p>
											{i18n.locale === 'pt'
												? 'Abas neubrutalistas com scroll horizontal opcional, botões de paginação inteligentes e suporte a ícones.'
												: i18n.locale === 'en'
													? 'Neubrutalist tabs with optional horizontal scrolling, smart pagination buttons, and icon support.'
													: 'Pestañas neubrutalistas con desplazamiento horizontal opcional, botones de paginación inteligentes y soporte de iconos.'}
										</p>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(tabsCode, 22)}>
									{copiedIndex === 22 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{tabsCode}</code></pre>
						</div>
					</div>

					<!-- Icons Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>{i18n.t('icons.title')}</h3>
							<p>{i18n.t('icons.description')}</p>
						</div>
						<div class="component-showcase-grid layout-vertical">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render" style="padding: var(--space-md);">
									<div class="icons-grid">
										{#each allIcons as icon (icon.name)}
											<button
												class="icon-showcase-btn"
												class:active={selectedIconName === icon.name}
												onclick={() => {
													selectedIconName = icon.name;
													addToast(`Ícone selecionado: ${icon.name}`, 'info');
												}}
											>
												<div class="icon-showcase-icon">
													<icon.component size={iconSizeKnob} />
												</div>
												<span class="icon-showcase-label">{icon.name}</span>
											</button>
										{/each}
									</div>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="icon-size-range">Tamanho (size):</label>
										<div style="display: flex; align-items: center; gap: var(--space-sm); flex: 1;">
											<input
												type="range"
												id="icon-size-range"
												min="12"
												max="48"
												step="2"
												bind:value={iconSizeKnob}
												style="flex: 1;"
											/>
											<span class="status-badge">{iconSizeKnob}px</span>
										</div>
									</div>
									<div class="knob-row">
										<span class="knob-label">Ícone Ativo:</span>
										<span class="status-badge">{selectedIconName}</span>
									</div>
									<div
										style="font-size: var(--text-sm); line-height: 1.5; color: var(--text-secondary); margin-top: var(--space-md); display: flex; flex-direction: column; gap: var(--space-xs);"
									>
										<p>Todos os ícones aceitam as seguintes propriedades:</p>
										<ul
											style="padding-left: var(--space-md); margin: 0; display: flex; flex-direction: column; gap: var(--space-xs);"
										>
											<li>
												<code>size?: number</code> - Tamanho em pixels (largura/altura). Padrão:
												<code>24</code>.
											</li>
											<li>
												<code>class?: string</code> - Classes adicionais para customização CSS.
											</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button
									onclick={() =>
										copyToClipboard(
											`import ${selectedIconName === 'X' ? 'XIcon' : selectedIconName === 'Folder' ? 'FolderIcon' : selectedIconName} from '$lib/components/icons/${selectedIconName === 'Folder' ? 'Folder' : selectedIconName === 'X' ? 'X' : selectedIconName}.svelte';\n\n<${selectedIconName === 'X' ? 'XIcon' : selectedIconName === 'Folder' ? 'FolderIcon' : selectedIconName} size={${iconSizeKnob}} />`,
											23
										)}
								>
									{copiedIndex === 23 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code
									>{`import ${selectedIconName === 'X' ? 'XIcon' : selectedIconName === 'Folder' ? 'FolderIcon' : selectedIconName} from '$lib/components/icons/${selectedIconName === 'Folder' ? 'Folder' : selectedIconName === 'X' ? 'X' : selectedIconName}.svelte';\n\n<${selectedIconName === 'X' ? 'XIcon' : selectedIconName === 'Folder' ? 'FolderIcon' : selectedIconName} size={${iconSizeKnob}} />`}</code
								></pre>
						</div>
					</div>

					<!-- Badge Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Badge</h3>
							<p>
								{i18n.t('badge.description')}
							</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="preview-render"
									style="display: flex; gap: var(--space-sm); flex-wrap: wrap; align-items: center; justify-content: center; min-height: 100px;"
								>
									<Badge variant="default"
										>{i18n.locale === 'pt'
											? 'Padrão'
											: i18n.locale === 'en'
												? 'Default'
												: 'Estándar'}</Badge
									>
									<Badge variant="primary"
										>{i18n.locale === 'pt'
											? 'Principal'
											: i18n.locale === 'en'
												? 'Primary'
												: 'Principal'}</Badge
									>
									<Badge variant="secondary"
										>{i18n.locale === 'pt'
											? 'Secundário'
											: i18n.locale === 'en'
												? 'Secondary'
												: 'Secundario'}</Badge
									>
									<Badge variant="due"
										>{i18n.locale === 'pt'
											? 'Pendente'
											: i18n.locale === 'en'
												? 'Due'
												: 'Pendiente'}</Badge
									>
									<Badge variant="new"
										>{i18n.locale === 'pt' ? 'Novo' : i18n.locale === 'en' ? 'New' : 'Nuevo'}</Badge
									>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div
									class="knobs-content"
									style="font-size: var(--text-sm); line-height: 1.5; color: var(--text-secondary); display: flex; flex-direction: column; gap: var(--space-xs);"
								>
									<div class="knobs-help">
										<p>{i18n.t('knobs.badge_desc')}</p>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button
									onclick={() =>
										copyToClipboard(
											`import Badge from '$lib/components/Badge.svelte';\n\n<Badge variant="due">${i18n.locale === 'pt' ? 'Revisões pendentes' : i18n.locale === 'en' ? 'Pending reviews' : 'Revisiones pendientes'}</Badge>\n<Badge variant="new">${i18n.locale === 'pt' ? 'Novo item' : i18n.locale === 'en' ? 'New item' : 'Nuevo artículo'}</Badge>`,
											30
										)}
								>
									{copiedIndex === 30 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code
									>import Badge from '$lib/components/Badge.svelte';

&lt;Badge variant="due"&gt;{i18n.locale === 'pt'
										? 'Revisões pendentes'
										: i18n.locale === 'en'
											? 'Pending reviews'
											: 'Revisiones pendientes'}&lt;/Badge&gt;
&lt;Badge variant="new"&gt;{i18n.locale === 'pt'
										? 'Novo item'
										: i18n.locale === 'en'
											? 'New item'
											: 'Nuevo artículo'}&lt;/Badge&gt;</code
								></pre>
						</div>
					</div>

					<!-- QuickActions Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>QuickActions</h3>
							<p>
								{i18n.t('quickActions.description')}
							</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box" style="z-index: 50;">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="preview-render"
									style="display: flex; gap: var(--space-lg); align-items: center; justify-content: center; min-height: 140px; padding: var(--space-md); position: relative;"
								>
									<div
										style="display: flex; flex-direction: column; align-items: center; gap: var(--space-xs);"
									>
										<span
											style="font-size: var(--text-xs); font-weight: 700; color: var(--text-secondary);"
											>{i18n.locale === 'pt'
												? '1. Variante: dropdown (Largura fluida)'
												: i18n.locale === 'en'
													? '1. Variant: dropdown (Fluid width)'
													: '1. Variante: dropdown (Ancho fluido)'}</span
										>
										<QuickActions variant="dropdown" align="left" width="max-content">
											{#snippet trigger()}
												<Button variant="secondary" size="sm"
													>{i18n.locale === 'pt'
														? 'Opções'
														: i18n.locale === 'en'
															? 'Options'
															: 'Opciones'}</Button
												>
											{/snippet}
											<button
												class="dropdown-item"
												onclick={() =>
													addToast(
														i18n.locale === 'pt'
															? 'Configurações clicadas'
															: i18n.locale === 'en'
																? 'Settings clicked'
																: 'Configuraciones clicadas',
														'info'
													)}
												>{i18n.locale === 'pt'
													? 'Configurações'
													: i18n.locale === 'en'
														? 'Settings'
														: 'Configuraciones'}</button
											>
											<Separator />
											<button
												class="dropdown-item"
												onclick={() =>
													addToast(
														i18n.locale === 'pt'
															? 'Ajuda clicada'
															: i18n.locale === 'en'
																? 'Help clicked'
																: 'Ayuda clicada',
														'info'
													)}
												>{i18n.locale === 'pt'
													? 'Ajuda'
													: i18n.locale === 'en'
														? 'Help'
														: 'Ayuda'}</button
											>
										</QuickActions>
									</div>

									<div
										style="display: flex; flex-direction: column; align-items: center; gap: var(--space-xs); width: 180px; position: relative;"
									>
										<span
											style="font-size: var(--text-xs); font-weight: 700; color: var(--text-secondary);"
											>{i18n.locale === 'pt'
												? '2. Variante: reveal'
												: i18n.locale === 'en'
													? '2. Variant: reveal'
													: '2. Variante: reveal'}</span
										>
										<!-- Container que simula o card pai -->
										<div
											class="demo-card-reveal-parent"
											style="position: relative; width: 100%; height: 60px; border: var(--border-width) solid var(--border-color); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; padding: 0 var(--space-sm); background: var(--bg-primary);"
										>
											<span style="font-weight: 700; font-size: var(--text-xs);">Card Demo</span>

											<QuickActions variant="reveal" align="right" width="80%">
												{#snippet trigger()}
													<button
														class="btn-icon"
														style="background: none; border: none; cursor: pointer; color: var(--text-secondary); display: flex; align-items: center; justify-content: center;"
														aria-label={i18n.locale === 'pt'
															? 'Mais opções'
															: i18n.locale === 'en'
																? 'More options'
																: 'Más opciones'}
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="18"
															height="18"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															stroke-width="2.5"
															stroke-linecap="round"
															stroke-linejoin="round"
														>
															<circle cx="12" cy="12" r="1.5" />
															<circle cx="12" cy="5" r="1.5" />
															<circle cx="12" cy="19" r="1.5" />
														</svg>
													</button>
												{/snippet}
												<div
													style="display: flex; gap: var(--space-xs); padding: var(--space-xs); align-items: center; box-sizing: border-box; justify-content: flex-end;"
												>
													<Button
														variant="secondary"
														size="sm"
														onclick={() =>
															addToast(
																i18n.locale === 'pt'
																	? 'Editar'
																	: i18n.locale === 'en'
																		? 'Edit'
																		: 'Editar',
																'info'
															)}
														class="btn-sm context-btn"
														style={quickActionsRevealMode === 'icon-only'
															? 'width: 32px; height: 32px; padding: 0 !important; aspect-ratio: 1; min-width: 0;'
															: 'padding: 4px 8px !important; font-size: 11px; width: auto; min-width: 0;'}
													>
														<Pencil size={16} />
														{#if quickActionsRevealMode === 'text-icon'}
															<span style="font-size: 11px;"
																>{i18n.locale === 'pt'
																	? 'Edição'
																	: i18n.locale === 'en'
																		? 'Edit'
																		: 'Edición'}</span
															>
														{/if}
													</Button>
													<Button
														variant="secondary"
														size="sm"
														onclick={() =>
															addToast(
																i18n.locale === 'pt'
																	? 'Excluir'
																	: i18n.locale === 'en'
																		? 'Delete'
																		: 'Eliminar',
																'error'
															)}
														class="btn-sm btn-delete context-btn"
														style={quickActionsRevealMode === 'icon-only'
															? 'width: 32px; height: 32px; padding: 0 !important; aspect-ratio: 1; min-width: 0;'
															: 'padding: 4px 8px !important; font-size: 11px; width: auto; min-width: 0;'}
													>
														<Trash size={16} />
														{#if quickActionsRevealMode === 'text-icon'}
															<span style="font-size: 11px;"
																>{i18n.locale === 'pt'
																	? 'Lixo'
																	: i18n.locale === 'en'
																		? 'Trash'
																		: 'Papelera'}</span
															>
														{/if}
													</Button>
												</div>
											</QuickActions>
										</div>
									</div>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="quick-actions-reveal-mode"
											>{i18n.locale === 'pt'
												? 'Modo do Reveal:'
												: i18n.locale === 'en'
													? 'Reveal Mode:'
													: 'Modo de Reveal:'}</label
										>
										<select
											id="quick-actions-reveal-mode"
											bind:value={quickActionsRevealMode}
											class="select-knob"
										>
											<option value="text-icon"
												>{i18n.locale === 'pt'
													? 'Texto e Ícone'
													: i18n.locale === 'en'
														? 'Text and Icon'
														: 'Texto e Icono'}</option
											>
											<option value="icon-only"
												>{i18n.locale === 'pt'
													? 'Apenas Ícones'
													: i18n.locale === 'en'
														? 'Icons Only'
														: 'Solo Iconos'}</option
											>
										</select>
									</div>
									<div class="knobs-help" style="margin-top: var(--space-sm);">
										<p>{i18n.t('knobs.quick_actions_desc')}</p>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(quickActionsCode, 31)}>
									{copiedIndex === 31 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{quickActionsCode}</code></pre>
						</div>
					</div>

					<!-- Credits Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Credits</h3>
							<p>
								{i18n.t('credits.description')}
							</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="preview-render"
									style="display: flex; align-items: center; justify-content: center; min-height: 100px; width: 100%;"
								>
									<Credits
										authorName="MonsanUI"
										authorLink="https://github.com/lucasmonsan"
										copyright={creditsCopyright}
										variant={creditsVariant}
									/>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<span class="knob-label">Copyright:</span>
										<input
											type="text"
											class="monsan-input"
											bind:value={creditsCopyright}
											style="width: 160px;"
										/>
									</div>
									<div class="knob-row">
										<label for="credits-variant-select" class="knob-label">Variant:</label>
										<select
											id="credits-variant-select"
											bind:value={creditsVariant}
											class="select-knob"
											style="width: 160px;"
										>
											<option value="default">Default</option>
											<option value="compact">Compact</option>
										</select>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(creditsCode, 32)}>
									{copiedIndex === 32 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{creditsCode}</code></pre>
						</div>
					</div>

					<!-- SplashScreen Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>SplashScreen</h3>
							<p>
								Uma tela de carregamento inicial (Splash Screen) estilizada que persiste no
								sessionStorage para ser exibida apenas uma vez por sessão.
							</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="preview-render"
									style="display: flex; align-items: center; justify-content: center; min-height: 100px; width: 100%;"
								>
									<Button variant="primary" onclick={() => (showSplashPreview = true)}>
										Testar SplashScreen (2s)
									</Button>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div
										class="knob-row"
										style="color: var(--text-secondary); font-size: var(--text-xs); line-height: 1.4;"
									>
										A Splash Screen abrirá em tela cheia com duração mínima de 2 segundos, depois
										sumirá suavemente.
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(splashScreenCode, 33)}>
									{copiedIndex === 33 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{splashScreenCode}</code></pre>
						</div>
					</div>

					<!-- Text Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Text</h3>
							<p>{i18n.t('text.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="preview-render"
									style="display: flex; align-items: center; justify-content: center; min-height: 100px; width: 100%;"
								>
									<Text
										tag={textTag}
										family={textFamily}
										size={textSize}
										weight={textWeight}
										variant={textVariant}
									>
										{i18n.locale === 'pt'
											? 'Esta é uma amostra de texto tipográfico neubrutalista.'
											: i18n.locale === 'en'
												? 'This is a sample of neubrutalist typographic text.'
												: 'Esta es una muestra de texto tipográfico neubrutalista.'}
									</Text>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="text-tag-select" class="knob-label">{i18n.t('text.tag')}</label>
										<select id="text-tag-select" bind:value={textTag} class="select-knob">
											<option value="p">p</option>
											<option value="span">span</option>
											<option value="div">div</option>
											<option value="label">label</option>
											<option value="small">small</option>
											<option value="h1">h1</option>
											<option value="h2">h2</option>
											<option value="h3">h3</option>
											<option value="h4">h4</option>
											<option value="h5">h5</option>
											<option value="h6">h6</option>
										</select>
									</div>
									<div class="knob-row">
										<label for="text-family-select" class="knob-label"
											>{i18n.t('text.family')}</label
										>
										<select id="text-family-select" bind:value={textFamily} class="select-knob">
											<option value="body">body</option>
											<option value="display">display</option>
										</select>
									</div>
									<div class="knob-row">
										<label for="text-size-select" class="knob-label">{i18n.t('text.size')}</label>
										<select id="text-size-select" bind:value={textSize} class="select-knob">
											<option value="sm">sm</option>
											<option value="md">md</option>
											<option value="lg">lg</option>
											<option value="xl">xl</option>
											<option value="2xl">2xl</option>
											<option value="3xl">3xl</option>
										</select>
									</div>
									<div class="knob-row">
										<label for="text-weight-select" class="knob-label"
											>{i18n.t('text.weight')}</label
										>
										<select id="text-weight-select" bind:value={textWeight} class="select-knob">
											<option value="normal">normal</option>
											<option value="medium">medium</option>
											<option value="semibold">semibold</option>
											<option value="bold">bold</option>
										</select>
									</div>
									<div class="knob-row">
										<label for="text-variant-select" class="knob-label"
											>{i18n.t('text.variant')}</label
										>
										<select id="text-variant-select" bind:value={textVariant} class="select-knob">
											<option value="primary">primary</option>
											<option value="secondary">secondary</option>
											<option value="accent">accent</option>
											<option value="success">success</option>
											<option value="error">error</option>
											<option value="neutral">neutral</option>
										</select>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(textCode, 1001)}>
									{copiedIndex === 1001 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{textCode}</code></pre>
						</div>
					</div>

					<!-- Panel Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Panel</h3>
							<p>{i18n.t('panel.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="preview-render"
									style="display: flex; align-items: center; justify-content: center; min-height: 120px; width: 100%;"
								>
									<Panel
										interactive={panelInteractive}
										variant={panelVariant}
										padding={panelPadding}
										maxWidth={panelMaxWidth}
										onclick={() => {
											if (panelInteractive) {
												addToast(
													i18n.locale === 'pt'
														? 'Painel clicado!'
														: i18n.locale === 'en'
															? 'Panel clicked!'
															: '¡Panel cliqueado!',
													'info'
												);
											}
										}}
									>
										<div style="text-align: center;">
											<h4 style="margin: 0 0 var(--space-xs) 0; font-family: inherit;">
												{i18n.t('panel.title')}
											</h4>
											<p
												style="margin: 0; font-size: var(--text-sm); color: inherit; opacity: 0.8;"
											>
												{i18n.t('panel.content')}
											</p>
										</div>
									</Panel>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="panel-interactive-checkbox" class="knob-label"
											>{i18n.t('panel.interactive')}</label
										>
										<input
											type="checkbox"
											id="panel-interactive-checkbox"
											bind:checked={panelInteractive}
										/>
									</div>
									<div class="knob-row">
										<label for="panel-variant-select" class="knob-label"
											>{i18n.t('panel.variant')}</label
										>
										<select id="panel-variant-select" bind:value={panelVariant} class="select-knob">
											<option value="primary">primary</option>
											<option value="secondary">secondary</option>
											<option value="accent">accent</option>
											<option value="success">success</option>
											<option value="error">error</option>
											<option value="neutral">neutral</option>
										</select>
									</div>
									<div class="knob-row">
										<span class="knob-label">{i18n.t('panel.padding')}</span>
										<input
											type="text"
											class="monsan-input"
											bind:value={panelPadding}
											style="width: 140px;"
										/>
									</div>
									<div class="knob-row">
										<span class="knob-label">
											{i18n.locale === 'pt'
												? 'Largura Máxima'
												: i18n.locale === 'en'
													? 'Max Width'
													: 'Ancho Máximo'}
										</span>
										<input
											type="text"
											class="monsan-input"
											bind:value={panelMaxWidth}
											style="width: 140px;"
										/>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(panelCode, 998)}>
									{copiedIndex === 998 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{panelCode}</code></pre>
						</div>
					</div>

					<!-- PageContainer Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>PageContainer</h3>
							<p>{i18n.t('pagecontainer.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render" style="padding: 0;">
									<PageContainer maxWidth={pageContainerMaxWidth} padding={pageContainerPadding}>
										<div
											style="background: var(--bg-secondary); border: var(--border-width) dashed var(--border-color); padding: var(--space-xl); text-align: center; border-radius: var(--radius-md); height: 100%;"
										>
											<p style="font-weight: bold; margin: 0;">{i18n.t('pagecontainer.content')}</p>
											<p
												style="font-size: var(--text-sm); margin-top: var(--space-sm); color: var(--text-secondary);"
											>
												(Max Width: {pageContainerMaxWidth})
											</p>
										</div>
									</PageContainer>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<span class="knob-label">{i18n.t('pagecontainer.maxWidth')}</span>
										<input
											type="text"
											class="monsan-input"
											bind:value={pageContainerMaxWidth}
											style="width: 140px;"
										/>
									</div>
									<div class="knob-row">
										<span class="knob-label">{i18n.t('pagecontainer.padding')}</span>
										<input
											type="text"
											class="monsan-input"
											bind:value={pageContainerPadding}
											style="width: 140px;"
										/>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(pageContainerCode, 999)}>
									{copiedIndex === 999 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{pageContainerCode}</code></pre>
						</div>
					</div>
				{/if}

				{#if activeCategory === 'forms'}
					<h2 class="category-title">{i18n.t('categories.forms')}</h2>

					<!-- Input Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Input</h3>
							<p>{i18n.t('input.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render">
									<Input
										bind:value={inputValue}
										size={inputSize}
										type={inputType}
										showPasswordToggle={inputPasswordToggle}
										placeholder={inputType === 'password'
											? i18n.locale === 'pt'
												? 'Digite sua senha...'
												: i18n.locale === 'en'
													? 'Enter password...'
													: 'Escriba su contraseña...'
											: i18n.locale === 'pt'
												? 'Digite seu texto...'
												: i18n.locale === 'en'
													? 'Enter text...'
													: 'Escriba su texto...'}
									/>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="input-size">{i18n.t('knobs.size')}</label>
										<select id="input-size" bind:value={inputSize} class="select-knob">
											<option value="sm">sm</option>
											<option value="md">md</option>
										</select>
									</div>
									<div class="knob-row">
										<label for="input-type">{i18n.t('knobs.type')}</label>
										<select id="input-type" bind:value={inputType} class="select-knob">
											<option value="text"
												>{i18n.locale === 'pt'
													? 'Texto'
													: i18n.locale === 'en'
														? 'Text'
														: 'Texto'}</option
											>
											<option value="password"
												>{i18n.locale === 'pt'
													? 'Senha'
													: i18n.locale === 'en'
														? 'Password'
														: 'Contraseña'}</option
											>
										</select>
									</div>
									{#if inputType === 'password'}
										<div class="knob-row" style="margin-top: var(--space-xs);">
											<Checkbox
												bind:checked={inputPasswordToggle}
												label={i18n.t('knobs.show_password_toggle')}
											/>
										</div>
									{/if}
									<div class="knob-row" style="margin-top: var(--space-sm);">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Valor atual:'
												: i18n.locale === 'en'
													? 'Current value:'
													: 'Valor actual:'}</span
										>
										<span
											class="status-badge"
											style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
											>{inputValue}</span
										>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(inputCode, 6)}>
									{copiedIndex === 6 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{inputCode}</code></pre>
						</div>
					</div>

					<!-- Checkbox Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Checkbox</h3>
							<p>{i18n.t('checkbox.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render" style="justify-content: flex-start;">
									<Checkbox
										bind:checked={checkboxVal}
										label={i18n.locale === 'pt'
											? 'Aceito receber e-mails com novidades'
											: i18n.locale === 'en'
												? 'I agree to receive newsletters'
												: 'Acepto recibir correos con novedades'}
									/>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Marcado:'
												: i18n.locale === 'en'
													? 'Checked:'
													: 'Marcado:'}</span
										>
										<span class="status-badge variant-{checkboxVal ? 'success' : 'neutral'}">
											{checkboxVal ? 'true' : 'false'}
										</span>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(checkboxCode, 13)}>
									{copiedIndex === 13 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{checkboxCode}</code></pre>
						</div>
					</div>

					<!-- Radio Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Radio</h3>
							<p>{i18n.t('radio.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="preview-render full-width-render"
									style="flex-direction: column; align-items: flex-start; gap: var(--space-sm);"
								>
									<Radio
										bind:group={radioVal}
										value="opcao1"
										label={i18n.locale === 'pt'
											? 'Plano Mensal Básico'
											: i18n.locale === 'en'
												? 'Basic Monthly Plan'
												: 'Plan Mensual Básico'}
									/>
									<Radio
										bind:group={radioVal}
										value="opcao2"
										label={i18n.locale === 'pt'
											? 'Plano Anual Premium'
											: i18n.locale === 'en'
												? 'Premium Annual Plan'
												: 'Plan Anual Premium'}
									/>
									<Radio
										bind:group={radioVal}
										value="opcao3"
										label={i18n.locale === 'pt'
											? 'Apenas Teste Grátis'
											: i18n.locale === 'en'
												? 'Free Trial Only'
												: 'Solo Prueba Gratis'}
									/>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Opção selecionada:'
												: i18n.locale === 'en'
													? 'Selected option:'
													: 'Opción seleccionada:'}</span
										>
										<span class="status-badge">{radioVal}</span>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(radioCode, 14)}>
									{copiedIndex === 14 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{radioCode}</code></pre>
						</div>
					</div>

					<!-- Range Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Range</h3>
							<p>{i18n.t('range.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="preview-render full-width-render"
									style="flex-direction: column; gap: var(--space-lg);"
								>
									<Range bind:value={rangeVal} min={0} max={100} />

									<!-- Elemento reativo com design neubrutalista que reage ao range -->
									<div
										style="
											width: 80px;
											height: 80px;
											background-color: var(--accent-primary);
											border: var(--border-width) solid var(--border-color);
											box-shadow: var(--shadow-sm);
											display: flex;
											align-items: center;
											justify-content: center;
											font-weight: 800;
											font-family: var(--font-mono);
											transition: transform 0.1s var(--ease-out);
											transform: rotate({rangeVal * 3.6}deg) scale({0.5 + rangeVal / 100});
										"
									>
										{rangeVal}%
									</div>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Valor atual:'
												: i18n.locale === 'en'
													? 'Current value:'
													: 'Valor actual:'}</span
										>
										<span class="status-badge">{rangeVal}</span>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(rangeCode, 15)}>
									{copiedIndex === 15 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{rangeCode}</code></pre>
						</div>
					</div>

					<!-- Color Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>ColorPicker</h3>
							<p>{i18n.t('colorPicker.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="preview-render full-width-render"
									style="gap: var(--space-md); align-items: center;"
								>
									<ColorPicker bind:value={colorVal} />

									<!-- Bloco de preview de cor -->
									<div
										style="
											width: 50px;
											height: 50px;
											background-color: {colorVal};
											border: var(--border-width) solid var(--border-color);
											box-shadow: var(--shadow-sm);
											border-radius: var(--radius-sm);
										"
									></div>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Hexadecimal:'
												: i18n.locale === 'en'
													? 'Hexadecimal:'
													: 'Hexadecimal:'}</span
										>
										<span class="status-badge" style="font-family: var(--font-mono);"
											>{colorVal}</span
										>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(colorCode, 16)}>
									{copiedIndex === 16 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{colorCode}</code></pre>
						</div>
					</div>

					<!-- File Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>FileUpload</h3>
							<p>{i18n.t('fileUpload.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box" style="min-height: 220px;">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render">
									{#if fileVariant === 'invisible'}
										<!-- invisible: mostra um botão nativo como trigger -->
										<div
											style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-sm);"
										>
											<FileUpload
												variant="invisible"
												bind:files={fileInvisibleFiles}
												multiple={true}
											>
												{#snippet trigger({ open }: { open: () => void })}
													<button
														type="button"
														onclick={open}
														style="display: inline-flex; align-items: center; gap: var(--space-xs); padding: 0 var(--space-md); height: var(--control-height); background: var(--accent-primary); color: var(--bg-primary); border: var(--border-width) solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); font-family: var(--font-body); font-size: var(--text-sm); font-weight: 700; cursor: pointer;"
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
															stroke-width="2.5"
															stroke="currentColor"
															style="width:16px;height:16px;"
															><path
																stroke-linecap="round"
																stroke-linejoin="round"
																d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
															/></svg
														>
														{i18n.locale === 'pt'
															? 'Carregar arquivo'
															: i18n.locale === 'en'
																? 'Upload file'
																: 'Cargar archivo'}
													</button>
												{/snippet}
											</FileUpload>
											{#if fileInvisibleFiles && fileInvisibleFiles.length > 0}
												<span style="font-size: var(--text-xs); color: var(--text-secondary);">
													{fileInvisibleFiles.length === 1
														? fileInvisibleFiles[0].name
														: `${fileInvisibleFiles.length} ${i18n.locale === 'pt' ? 'arquivos' : i18n.locale === 'en' ? 'files' : 'archivos'}`}
												</span>
											{/if}
										</div>
									{:else}
										<FileUpload
											bind:files={fileVal}
											variant={fileVariant}
											multiple={true}
											placeholder={i18n.locale === 'pt'
												? fileVariant === 'overlay'
													? 'Arraste arquivos para qualquer lugar da página'
													: 'Arraste seus arquivos ou clique para carregar'
												: i18n.locale === 'en'
													? fileVariant === 'overlay'
														? 'Drag files anywhere on the page'
														: 'Drag your files or click to upload'
													: fileVariant === 'overlay'
														? 'Arrastre archivos a cualquier lugar de la página'
														: 'Arrastre sus archivos o haga clic para cargar'}
											buttonLabel={i18n.locale === 'pt'
												? 'Escolher arquivo'
												: i18n.locale === 'en'
													? 'Browse files'
													: 'Examinar archivos'}
										/>
									{/if}
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="file-variant-select" class="knob-label"
											>{i18n.t('fileUpload.variant')}</label
										>
										<select id="file-variant-select" bind:value={fileVariant} class="select-knob">
											<option value="default">default</option>
											<option value="invisible">invisible</option>
											<option value="compact">compact</option>
											<option value="overlay">overlay</option>
										</select>
									</div>
									{#if fileVariant !== 'invisible'}
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Arquivos Selecionados:'
												: i18n.locale === 'en'
													? 'Selected Files:'
													: 'Archivos Seleccionados:'}</span
										>
										<div
											style="margin-top: var(--space-xs); display: flex; flex-direction: column; gap: var(--space-xs);"
										>
											{#if fileVal && fileVal.length > 0}
												{#each Array.from(fileVal) as f, index (f.name + f.size + index)}
													<div
														class="status-badge"
														style="display: flex; justify-content: space-between; gap: var(--space-md); font-size: var(--text-xs); max-width: 250px; overflow: hidden;"
													>
														<span
															style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;"
															>{f.name}</span
														>
														<span style="font-weight: bold;">{Math.round(f.size / 1024)}KB</span>
													</div>
												{/each}
											{:else}
												<span class="status-badge variant-neutral"
													>{i18n.locale === 'pt'
														? 'Nenhum arquivo carregado'
														: i18n.locale === 'en'
															? 'No files uploaded'
															: 'Ningún archivo cargado'}</span
												>
											{/if}
										</div>
									{:else}
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Arquivos (invisible):'
												: i18n.locale === 'en'
													? 'Files (invisible):'
													: 'Archivos (invisible):'}</span
										>
										<span class="status-badge variant-neutral">
											{fileInvisibleFiles && fileInvisibleFiles.length > 0
												? fileInvisibleFiles.length === 1
													? fileInvisibleFiles[0].name
													: `${fileInvisibleFiles.length} ${i18n.locale === 'pt' ? 'arquivos' : i18n.locale === 'en' ? 'files' : 'archivos'}`
												: i18n.locale === 'pt'
													? 'Nenhum arquivo'
													: i18n.locale === 'en'
														? 'No files'
														: 'Sin archivos'}
										</span>
									{/if}
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(fileCode, 17)}>
									{copiedIndex === 17 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{fileCode}</code></pre>
						</div>
					</div>

					<!-- Time Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>TimePicker</h3>
							<p>{i18n.t('timePicker.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render">
									<TimePicker bind:value={timeVal} />
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Horário Vinculado:'
												: i18n.locale === 'en'
													? 'Bound Time:'
													: 'Hora Vinculada:'}</span
										>
										<span class="status-badge" style="font-family: var(--font-mono);"
											>{timeVal}</span
										>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(timeCode, 18)}>
									{copiedIndex === 18 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{timeCode}</code></pre>
						</div>
					</div>

					<!-- DatePicker Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>DatePicker</h3>
							<p>{i18n.t('datePicker.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render">
									<DatePicker
										bind:value={datePickerVal}
										placeholder={i18n.locale === 'pt'
											? 'Escolha um dia...'
											: i18n.locale === 'en'
												? 'Choose a day...'
												: 'Elija un día...'}
									/>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Data Selecionada:'
												: i18n.locale === 'en'
													? 'Selected Date:'
													: 'Fecha Seleccionada:'}</span
										>
										<span class="status-badge" style="font-family: var(--font-mono);">
											{datePickerVal
												? datePickerVal.toLocaleDateString(
														i18n.locale === 'pt'
															? 'pt-BR'
															: i18n.locale === 'en'
																? 'en-US'
																: 'es-ES',
														{
															day: '2-digit',
															month: '2-digit',
															year: 'numeric'
														}
													)
												: i18n.locale === 'pt'
													? 'Nenhuma'
													: i18n.locale === 'en'
														? 'None'
														: 'Ninguna'}
										</span>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(datePickerCode, 19)}>
									{copiedIndex === 19 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{datePickerCode}</code></pre>
						</div>
					</div>

					<!-- Loading Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Loading</h3>
							<p>
								{i18n.locale === 'pt'
									? 'Um overlay de tela cheia que bloqueia todas as interações do usuário e exibe um spinner neubrutalista animado para processos em execução.'
									: i18n.locale === 'en'
										? 'A full-screen overlay that blocks all user interactions and displays an animated neubrutalist spinner for running processes.'
										: 'Una superposición de pantalla completa que bloquea todas las interacciones del usuario y muestra un spinner neubrutalista animado para procesos en ejecución.'}
							</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render">
									<button
										type="button"
										class="native-btn"
										style="background-color: var(--accent-primary); color: var(--bg-primary); border: var(--border-width) solid var(--border-color); padding: var(--space-sm) var(--space-md); font-weight: bold; cursor: pointer; border-radius: var(--radius-sm); box-shadow: var(--shadow-sm);"
										onclick={triggerDemoLoading}
									>
										{i18n.locale === 'pt'
											? 'Disparar Loading (3 segundos)'
											: i18n.locale === 'en'
												? 'Trigger Loading (3 seconds)'
												: 'Disparar Loading (3 segundos)'}
									</button>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div
										class="knob-row"
										style="flex-direction: column; align-items: stretch; gap: var(--space-xs);"
									>
										<label for="demo-loading-msg" class="knob-label" style="font-weight: bold;">
											{i18n.locale === 'pt'
												? 'Mensagem Customizada:'
												: i18n.locale === 'en'
													? 'Custom Message:'
													: 'Mensaje Personalizado:'}
										</label>
										<input
											id="demo-loading-msg"
											type="text"
											bind:value={demoLoadingMessage}
											style="background: var(--bg-primary); border: var(--border-width) solid var(--border-color); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); width: 100%; box-sizing: border-box;"
										/>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(loadingCode, 1002)}>
									{copiedIndex === 1002 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{loadingCode}</code></pre>
						</div>
					</div>

					<!-- SearchBar Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>SearchBar</h3>
							<p>{i18n.t('searchBar.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box" style="overflow: visible;">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="preview-render full-width-render"
									style="overflow: visible; display: block; position: relative;"
								>
									<SearchBar
										bind:value={searchBarVal}
										suggestions={mockSuggestions}
										placeholder={i18n.locale === 'pt'
											? 'Pesquise tecnologias...'
											: i18n.locale === 'en'
												? 'Search technologies...'
												: 'Busque tecnologías...'}
									/>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Pesquisa ativa:'
												: i18n.locale === 'en'
													? 'Active search:'
													: 'Búsqueda activa:'}</span
										>
										<span
											class="status-badge"
											style="max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
										>
											{searchBarVal ||
												(i18n.locale === 'pt'
													? '(vazio)'
													: i18n.locale === 'en'
														? '(empty)'
														: '(vacío)')}
										</span>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(searchBarCode, 20)}>
									{copiedIndex === 20 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{searchBarCode}</code></pre>
						</div>
					</div>

					<!-- Chips Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Chips</h3>
							<p>{i18n.t('chips.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render">
									<Chips
										bind:value={chipsVal}
										placeholder={i18n.locale === 'pt'
											? 'Adicionar nova tag...'
											: i18n.locale === 'en'
												? 'Add new tag...'
												: 'Añadir nueva etiqueta...'}
									/>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<span class="knob-label"
										>{i18n.locale === 'pt'
											? 'Tags atuais'
											: i18n.locale === 'en'
												? 'Current tags'
												: 'Etiquetas actuales'} ({chipsVal.length}):</span
									>
									<div
										style="display: flex; flex-wrap: wrap; gap: var(--space-xs); margin-top: var(--space-xs);"
									>
										{#each chipsVal as chip (chip)}
											<span class="status-badge" style="font-size: var(--text-xs);">{chip}</span>
										{/each}
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(chipsCode, 21)}>
									{copiedIndex === 21 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{chipsCode}</code></pre>
						</div>
					</div>

					<!-- Textarea Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Textarea</h3>
							<p>{i18n.t('textarea.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render">
									<Textarea
										bind:value={textareaValue}
										size={textareaSize}
										placeholder={i18n.locale === 'pt'
											? 'Digite seu texto longo...'
											: i18n.locale === 'en'
												? 'Type your long text...'
												: 'Escriba su texto largo...'}
									/>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="textarea-size">{i18n.t('knobs.size')}</label>
										<select id="textarea-size" bind:value={textareaSize} class="select-knob">
											<option value="sm">sm</option>
											<option value="md">md</option>
										</select>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(textareaCode, 7)}>
									{copiedIndex === 7 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{textareaCode}</code></pre>
						</div>
					</div>

					<!-- Select Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Select</h3>
							<p>{i18n.t('select.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render">
									<Select
										bind:value={selectValue}
										options={selectOptions}
										placeholder={i18n.locale === 'pt'
											? 'Selecione uma opção'
											: i18n.locale === 'en'
												? 'Select an option'
												: 'Seleccione una opción'}
									/>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Valor Selecionado:'
												: i18n.locale === 'en'
													? 'Selected Value:'
													: 'Valor Seleccionado:'}</span
										>
										<span class="status-badge">{selectValue}</span>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button
									onclick={() =>
										copyToClipboard(
											`import Select from '$lib/components/Select.svelte';\n\n<Select bind:value={selectValue} options={[\n\t{ value: 'opt1', label: 'Opção 1' },\n\t{ value: 'opt2', label: 'Opção 2' }\n]} placeholder="Selecione..." />`,
											8
										)}
								>
									{copiedIndex === 8 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code
									>{`import Select from '$lib/components/Select.svelte';\n\n<Select bind:value={selectValue} options={[\n\t{ value: 'opt1', label: 'Opção 1' },\n\t{ value: 'opt2', label: 'Opção 2' }\n]} placeholder="Selecione..." />`}</code
								></pre>
						</div>
					</div>
				{/if}

				{#if activeCategory === 'overlays'}
					<h2 class="category-title">{i18n.t('categories.overlays')}</h2>

					<!-- Dialog Sizes Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Dialog</h3>
							<p>{i18n.t('dialog.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render">
									<div
										style="display: flex; gap: var(--space-sm); flex-wrap: wrap; justify-content: center;"
									>
										<Button variant="primary" onclick={() => (isDialogSmOpen = true)}
											>{i18n.locale === 'pt'
												? 'Abrir Pequeno (sm)'
												: i18n.locale === 'en'
													? 'Open Small (sm)'
													: 'Abrir Pequeño (sm)'}</Button
										>
										<Button variant="secondary" onclick={() => (isDialogMdOpen = true)}
											>{i18n.locale === 'pt'
												? 'Abrir Médio (md)'
												: i18n.locale === 'en'
													? 'Open Medium (md)'
													: 'Abrir Medio (md)'}</Button
										>
										<Button variant="neutral" onclick={() => (isDialogLgOpen = true)}
											>{i18n.locale === 'pt'
												? 'Abrir Grande (lg)'
												: i18n.locale === 'en'
													? 'Open Large (lg)'
													: 'Abrir Grande (lg)'}</Button
										>
									</div>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="dialog-animation">{i18n.t('knobs.animation')}</label>
										<select id="dialog-animation" bind:value={dialogAnimation} class="select-knob">
											<option value="pop"
												>{i18n.locale === 'pt'
													? 'pop (Efeito Elástico)'
													: i18n.locale === 'en'
														? 'pop (Elastic Effect)'
														: 'pop (Efecto Elástico)'}</option
											>
											<option value="slide"
												>{i18n.locale === 'pt'
													? 'slide (Deslizar)'
													: i18n.locale === 'en'
														? 'slide (Slide)'
														: 'slide (Deslizar)'}</option
											>
											<option value="fade"
												>{i18n.locale === 'pt'
													? 'fade (Opacidade)'
													: i18n.locale === 'en'
														? 'fade (Opacity)'
														: 'fade (Opacidad)'}</option
											>
											<option value="scale"
												>{i18n.locale === 'pt'
													? 'scale (Zoom Suave)'
													: i18n.locale === 'en'
														? 'scale (Soft Zoom)'
														: 'scale (Zoom Suave)'}</option
											>
										</select>
									</div>
									<div class="knobs-help" style="margin-top: var(--space-sm);">
										<p>{i18n.t('knobs.dialog_desc')}</p>
									</div>
								</div>
							</div>
						</div>

						<Dialog
							bind:open={isDialogSmOpen}
							size="sm"
							animation={dialogAnimation}
							title={i18n.locale === 'pt'
								? 'Diálogo Pequeno'
								: i18n.locale === 'en'
									? 'Small Dialog'
									: 'Diálogo Pequeño'}
						>
							<div style="display: flex; flex-direction: column; gap: var(--space-md);">
								<p>
									{i18n.locale === 'pt'
										? 'Este é o tamanho compacto (sm), perfeito para confirmações breves ou inputs simples.'
										: i18n.locale === 'en'
											? 'This is the compact size (sm), perfect for brief confirmations or simple inputs.'
											: 'Este es el tamaño compacto (sm), perfecto para confirmaciones breves o entradas simples.'}
								</p>
								<Button onclick={() => (isDialogSmOpen = false)}
									>{i18n.locale === 'pt'
										? 'Fechar'
										: i18n.locale === 'en'
											? 'Close'
											: 'Cerrar'}</Button
								>
							</div>
						</Dialog>

						<Dialog
							bind:open={isDialogMdOpen}
							size="md"
							animation={dialogAnimation}
							title={i18n.locale === 'pt'
								? 'Diálogo Médio'
								: i18n.locale === 'en'
									? 'Medium Dialog'
									: 'Diálogo Medio'}
						>
							<div style="display: flex; flex-direction: column; gap: var(--space-md);">
								<p>
									{i18n.locale === 'pt'
										? 'Este é o tamanho médio (md), sugerido para formulários padrão ou menus secundários.'
										: i18n.locale === 'en'
											? 'This is the medium size (md), suggested for standard forms or secondary menus.'
											: 'Este es el tamaño medio (md), sugerido para formularios estándar o menús secundarios.'}
								</p>
								<Input
									placeholder={i18n.locale === 'pt'
										? 'Escreva seu texto aqui...'
										: i18n.locale === 'en'
											? 'Type your text here...'
											: 'Escriba su texto aquí...'}
								/>
								<Button onclick={() => (isDialogMdOpen = false)}
									>{i18n.locale === 'pt'
										? 'Fechar'
										: i18n.locale === 'en'
											? 'Close'
											: 'Cerrar'}</Button
								>
							</div>
						</Dialog>

						<Dialog
							bind:open={isDialogLgOpen}
							size="lg"
							animation={dialogAnimation}
							title={i18n.locale === 'pt'
								? 'Diálogo Grande'
								: i18n.locale === 'en'
									? 'Large Dialog'
									: 'Diálogo Grande'}
						>
							<div style="display: flex; flex-direction: column; gap: var(--space-md);">
								<p>
									{i18n.locale === 'pt'
										? 'Este é o tamanho largo (lg), ideal para exibir coleções de dados, listagens extensas ou mídias detalhadas.'
										: i18n.locale === 'en'
											? 'This is the large size (lg), ideal for displaying data collections, extensive listings, or detailed media.'
											: 'Este es el tamaño grande (lg), ideal para mostrar colecciones de datos, listados extensos o medios detallados.'}
								</p>
								<div
									style="background: var(--bg-secondary); padding: var(--space-md); border-radius: var(--radius-sm); border: 2px solid var(--border-color);"
								>
									<h4>
										{i18n.locale === 'pt'
											? 'Painel de Controle'
											: i18n.locale === 'en'
												? 'Control Panel'
												: 'Panel de Control'}
									</h4>
									<p>
										{i18n.locale === 'pt'
											? 'Você pode renderizar qualquer árvore complexa de componentes aqui dentro.'
											: i18n.locale === 'en'
												? 'You can render any complex component tree inside here.'
												: 'Puede renderizar cualquier árbol de componentes complejo aquí dentro.'}
									</p>
								</div>
								<Button onclick={() => (isDialogLgOpen = false)}
									>{i18n.locale === 'pt'
										? 'Fechar'
										: i18n.locale === 'en'
											? 'Close'
											: 'Cerrar'}</Button
								>
							</div>
						</Dialog>

						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button
									onclick={() =>
										copyToClipboard(
											`import Dialog from '$lib/components/Dialog.svelte';\n\n<Dialog bind:open={isOpen} size="md" animation="${dialogAnimation}" title="Título">\n\t<p>Conteúdo do Dialog</p>\n</Dialog>`,
											9
										)}
								>
									{copiedIndex === 9 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code
									>{`import Dialog from '$lib/components/Dialog.svelte';\n\n<Dialog bind:open={isOpen} size="md" animation="${dialogAnimation}" title="Título">\n\t<p>Conteúdo do Dialog</p>\n</Dialog>`}</code
								></pre>
						</div>
					</div>

					<!-- ConfirmDialog Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>ConfirmDialog</h3>
							<p>{i18n.t('confirmDialog.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render">
									<Button variant="error" onclick={() => (isConfirmOpen = true)}
										>{i18n.locale === 'pt'
											? 'Excluir Item'
											: i18n.locale === 'en'
												? 'Delete Item'
												: 'Eliminar Elemento'}</Button
									>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="log-output">
										{i18n.locale === 'pt'
											? 'Resultado:'
											: i18n.locale === 'en'
												? 'Result:'
												: 'Resultado:'}
										{confirmResult}
									</div>
								</div>
							</div>
						</div>

						<ConfirmDialog
							bind:open={isConfirmOpen}
							title={i18n.locale === 'pt'
								? 'Confirmar exclusão'
								: i18n.locale === 'en'
									? 'Confirm deletion'
									: 'Confirmar eliminación'}
							message={i18n.locale === 'pt'
								? 'Esta ação é permanente e apagará o item selecionado de forma definitiva.'
								: i18n.locale === 'en'
									? 'This action is permanent and will permanently delete the selected item.'
									: 'Esta acción es permanente y eliminará el elemento seleccionado de forma definitiva.'}
							confirmText={i18n.locale === 'pt'
								? 'Excluir'
								: i18n.locale === 'en'
									? 'Delete'
									: 'Eliminar'}
							cancelText={i18n.locale === 'pt'
								? 'Cancelar'
								: i18n.locale === 'en'
									? 'Cancel'
									: 'Cancelar'}
							onConfirm={() => {
								confirmResult = 'Confirmado';
								addToast(
									i18n.locale === 'pt'
										? 'Ação confirmada!'
										: i18n.locale === 'en'
											? 'Action confirmed!'
											: '¡Acción confirmada!',
									'success'
								);
							}}
							onCancel={() => {
								confirmResult = 'Cancelado';
								addToast(
									i18n.locale === 'pt'
										? 'Ação cancelada!'
										: i18n.locale === 'en'
											? 'Action cancelled!'
											: '¡Acción cancelada!',
									'info'
								);
							}}
						/>

						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button
									onclick={() =>
										copyToClipboard(
											`import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';\n\n<ConfirmDialog\n\tbind:open={isConfirmOpen}\n\ttitle="Confirmar exclusão"\n\tmessage="Esta ação é permanente."\n\tconfirmText="Excluir"\n\tcancelText="Cancelar"\n\tonConfirm={handleConfirm}\n\tonCancel={handleCancel}\n/>`,
											10
										)}
								>
									{copiedIndex === 10 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code
									>{`import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';\n\n<ConfirmDialog\n\tbind:open={isConfirmOpen}\n\ttitle="Confirmar exclusão"\n\tmessage="Esta ação é permanente."\n\tconfirmText="Excluir"\n\tcancelText="Cancelar"\n\tonConfirm={handleConfirm}\n\tonCancel={handleCancel}\n/>`}</code
								></pre>
						</div>
					</div>

					<!-- MediaDialog Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>MediaDialog</h3>
							<p>{i18n.t('mediaDialog.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render">
									<Button variant="secondary" onclick={() => (isMediaOpen = true)}
										>{i18n.locale === 'pt'
											? 'Exibir Mídia'
											: i18n.locale === 'en'
												? 'Display Media'
												: 'Mostrar Medio'}</Button
									>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="media-type">{i18n.t('knobs.media_type')}</label>
										<select id="media-type" bind:value={mediaType} class="select-knob">
											<option value="image"
												>{i18n.locale === 'pt'
													? 'Imagem (Gerada)'
													: i18n.locale === 'en'
														? 'Image (Generated)'
														: 'Imagen (Generada)'}</option
											>
											<option value="youtube"
												>{i18n.locale === 'pt'
													? 'Vídeo (YouTube)'
													: i18n.locale === 'en'
														? 'Video (YouTube)'
														: 'Video (YouTube)'}</option
											>
											<option value="video"
												>{i18n.locale === 'pt'
													? 'Vídeo (Nativo HTML5)'
													: i18n.locale === 'en'
														? 'Video (Native HTML5)'
														: 'Video (Nativo HTML5)'}</option
											>
											<option value="audio"
												>{i18n.locale === 'pt'
													? 'Áudio (Nativo HTML5)'
													: i18n.locale === 'en'
														? 'Audio (Native HTML5)'
														: 'Audio (Nativo HTML5)'}</option
											>
										</select>
									</div>
									<div class="knob-row">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'URL da Mídia:'
												: i18n.locale === 'en'
													? 'Media URL:'
													: 'URL de Medio:'}</span
										>
										<span
											class="status-badge"
											style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
											title={mediaUrl}>{mediaUrl}</span
										>
									</div>
								</div>
							</div>
						</div>

						<MediaDialog
							bind:isOpen={isMediaOpen}
							{mediaType}
							{mediaUrl}
							onClose={() => (isMediaOpen = false)}
						/>

						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button
									onclick={() =>
										copyToClipboard(
											`import MediaDialog from '$lib/components/MediaDialog.svelte';\n\n<MediaDialog\n\tbind:isOpen={isMediaOpen}\n\tmediaType="${mediaType}"\n\tmediaUrl={mediaUrl}\n\tonClose={() => isMediaOpen = false}\n/>`,
											11
										)}
								>
									{copiedIndex === 11 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code
									>{`import MediaDialog from '$lib/components/MediaDialog.svelte';\n\n<MediaDialog\n\tbind:isOpen={isMediaOpen}\n\tmediaType="${mediaType}"\n\tmediaUrl={mediaUrl}\n\tonClose={() => isMediaOpen = false}\n/>`}</code
								></pre>
						</div>
					</div>

					<!-- Search Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Search</h3>
							<p>{i18n.t('searchDialog.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render">
									<Button variant="neutral" onclick={() => (isSearchOpen = true)}
										>{i18n.locale === 'pt'
											? 'Abrir Busca (Ctrl + K)'
											: i18n.locale === 'en'
												? 'Open Search (Ctrl + K)'
												: 'Abrir Búsqueda (Ctrl + K)'}</Button
									>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="log-output">
										{i18n.locale === 'pt'
											? 'Selecionado: '
											: i18n.locale === 'en'
												? 'Selected: '
												: 'Seleccionado: '}
										{searchResultText}
									</div>
								</div>
							</div>
						</div>

						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button
									onclick={() =>
										copyToClipboard(
											`import Search from '$lib/components/Search.svelte';\n\n<Search\n\tbind:open={isSearchOpen}\n\titems={items}\n\tonSelectResult={(item) => console.log(item)}\n/>`,
											12
										)}
								>
									{copiedIndex === 12 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code
									>{`import Search from '$lib/components/Search.svelte';\n\n<Search\n\tbind:open={isSearchOpen}\n\titems={items}\n\tonSelectResult={(item) => console.log(item)}\n/>`}</code
								></pre>
						</div>
					</div>
				{/if}

				{#if activeCategory === 'learning'}
					<h2 class="category-title">{i18n.t('categories.learning')}</h2>

					<!-- FlipCard Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>FlipCard</h3>
							<p>{i18n.t('flipCard.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div
								class="preview-box"
								style="align-items: center; justify-content: center; min-height: 440px; overflow: visible;"
							>
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="flipcard-drag-clipper"
									style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; border-radius: inherit; display: flex; align-items: center; justify-content: center;"
								>
									<div style="width: 85%; max-width: 360px;">
										<FlipCard
											bind:flipped={flashcardFlipped}
											ondrag={handleFlipCardDrag}
											ondragend={handleFlipCardDragEnd}
											onswipe={(dir) => {
												flashcardSwipeResult =
													(i18n.locale === 'pt'
														? 'Swipe detectado: '
														: i18n.locale === 'en'
															? 'Swipe detected: '
															: 'Deslizamiento detectado: ') + dir;
												addToast(
													(i18n.locale === 'pt'
														? 'Swipe para: '
														: i18n.locale === 'en'
															? 'Swipe to: '
															: 'Deslizar hacia: ') + dir,
													'success'
												);
											}}
										>
											{#snippet front()}
												<div
													class="card-content-front"
													style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center;"
												>
													<h4
														style="font-size: var(--text-lg); font-weight: 800; margin-bottom: var(--space-sm);"
													>
														{flashcardFront}
													</h4>
													<p
														style="font-size: var(--text-xs); color: var(--text-secondary); max-width: 80%;"
													>
														{i18n.locale === 'pt'
															? 'Clique para virar ou arraste para disparar swipe'
															: i18n.locale === 'en'
																? 'Click to flip or drag to swipe'
																: 'Haga clic para voltear o arrastre para deslizar'}
													</p>
												</div>
											{/snippet}
											{#snippet back()}
												<div
													class="card-content-back"
													style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center;"
												>
													<h4
														style="font-size: var(--text-lg); font-weight: 800; margin-bottom: var(--space-sm);"
													>
														{flashcardBack}
													</h4>
													<p
														style="font-size: var(--text-xs); color: var(--text-secondary); max-width: 80%;"
													>
														{i18n.locale === 'pt'
															? 'Clique para retornar'
															: i18n.locale === 'en'
																? 'Click to return'
																: 'Haga clic para volver'}
													</p>
												</div>
											{/snippet}
										</FlipCard>
									</div>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="flipcard-flipped">Flipped (bind:flipped):</label>
										<input type="checkbox" id="flipcard-flipped" bind:checked={flashcardFlipped} />
									</div>
									<div class="knob-row">
										<label for="fc-front"
											>{i18n.locale === 'pt'
												? 'Frente (Text):'
												: i18n.locale === 'en'
													? 'Front (Text):'
													: 'Frente (Text):'}</label
										>
										<input
											type="text"
											id="fc-front"
											bind:value={flashcardFront}
											class="input-knob"
										/>
									</div>
									<div class="knob-row">
										<label for="fc-back"
											>{i18n.locale === 'pt'
												? 'Verso (Text):'
												: i18n.locale === 'en'
													? 'Back (Text):'
													: 'Dorso (Text):'}</label
										>
										<input type="text" id="fc-back" bind:value={flashcardBack} class="input-knob" />
									</div>
									<div class="knob-row">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Coordenadas de Arrasto:'
												: i18n.locale === 'en'
													? 'Drag Coordinates:'
													: 'Coordenadas de Arrastre:'}</span
										>
										<span class="status-badge" style="font-family: monospace;"
											>X: {Math.round(flipCardOffset.x)}, Y: {Math.round(flipCardOffset.y)}</span
										>
									</div>
									<div class="log-output">{flashcardSwipeResult}</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(flipCardCode, 13)}>
									{copiedIndex === 13 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{flipCardCode}</code></pre>
						</div>
					</div>

					<!-- ExpandableCard Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>ExpandableCard</h3>
							<p>{i18n.t('expandableCard.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div
								class="preview-box"
								style="align-items: center; justify-content: center; min-height: 300px;"
							>
								<span class="box-label">{i18n.t('common.preview')}</span>
								<ExpandableCard
									bind:expanded={isExpandedDemo}
									title="O que são Runes no Svelte 5?"
									expandOn={expandOnSetting}
									showIndicator={true}
									showChevron={showChevronSetting}
									showText={showTextSetting}
									indicatorText={indicatorTextSetting}
									indicatorTextExpanded={indicatorTextExpandedSetting}
								>
									<div class="expandable-demo-body" style="text-align: left; width: 100%;">
										<p
											style="margin: 0 0 var(--space-sm) 0; font-size: var(--text-sm); line-height: 1.5;"
										>
											{i18n.locale === 'pt'
												? 'Runes são primitivos reativos introduzidos no Svelte 5 que substituem a sintaxe antiga baseada em let e $:. Eles trazem um controle mais granular e flexível da reatividade.'
												: i18n.locale === 'en'
													? 'Runes are reactive primitives introduced in Svelte 5 that replace the old syntax based on let and $:. They bring more granular and flexible control over reactivity.'
													: 'Las Runes son primitivos reactivos introducidos en Svelte 5 que reemplazan la sintaxis antigua basada en let y $:. Traen un control más granular y flexible de la reactividad.'}
										</p>
										<p
											style="margin: 0; font-size: var(--text-sm); font-weight: bold; color: var(--accent-primary);"
										>
											{i18n.locale === 'pt'
												? 'Exemplos: $state, $derived, $effect.'
												: i18n.locale === 'en'
													? 'Examples: $state, $derived, $effect.'
													: 'Ejemplos: $state, $derived, $effect.'}
										</p>
									</div>
								</ExpandableCard>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="expandable-expanded">Expanded (bind:expanded):</label>
										<input type="checkbox" id="expandable-expanded" bind:checked={isExpandedDemo} />
									</div>
									<div class="knob-row">
										<label for="expandable-expand-on"
											>{i18n.locale === 'pt'
												? 'Expandir ao clicar em:'
												: i18n.locale === 'en'
													? 'Expand on click:'
													: 'Expandir al hacer clic:'}</label
										>
										<select
											id="expandable-expand-on"
											bind:value={expandOnSetting}
											class="select-knob"
										>
											<option value="card"
												>{i18n.locale === 'pt'
													? 'card (Cartão Inteiro)'
													: i18n.locale === 'en'
														? 'card (Whole Card)'
														: 'card (Tarjeta Entera)'}</option
											>
											<option value="header"
												>{i18n.locale === 'pt'
													? 'header (Apenas Cabeçalho)'
													: i18n.locale === 'en'
														? 'header (Header Only)'
														: 'header (Solo Cabecera)'}</option
											>
											<option value="indicator"
												>{i18n.locale === 'pt'
													? 'indicator (Apenas Indicador/Chevron)'
													: i18n.locale === 'en'
														? 'indicator (Indicator/Chevron Only)'
														: 'indicator (Solo Indicador/Chevron)'}</option
											>
										</select>
									</div>
									<div class="knob-row">
										<label for="expandable-show-chevron"
											>{i18n.locale === 'pt'
												? 'Mostrar Chevron:'
												: i18n.locale === 'en'
													? 'Show Chevron:'
													: 'Mostrar Chevron:'}</label
										>
										<input
											type="checkbox"
											id="expandable-show-chevron"
											bind:checked={showChevronSetting}
										/>
									</div>
									<div class="knob-row">
										<label for="expandable-show-text"
											>{i18n.locale === 'pt'
												? 'Mostrar Texto no Rodapé:'
												: i18n.locale === 'en'
													? 'Show Footer Text:'
													: 'Mostrar Texto del Pie:'}</label
										>
										<input
											type="checkbox"
											id="expandable-show-text"
											bind:checked={showTextSetting}
										/>
									</div>
									<div class="knob-row">
										<label for="expandable-text-collapsed"
											>{i18n.locale === 'pt'
												? 'Texto Contraído:'
												: i18n.locale === 'en'
													? 'Collapsed Text:'
													: 'Texto Contraído:'}</label
										>
										<input
											type="text"
											id="expandable-text-collapsed"
											bind:value={indicatorTextSetting}
											class="input-knob"
											style="width: 130px;"
										/>
									</div>
									<div class="knob-row">
										<label for="expandable-text-expanded"
											>{i18n.locale === 'pt'
												? 'Texto Expandido:'
												: i18n.locale === 'en'
													? 'Expanded Text:'
													: 'Texto Expandido:'}</label
										>
										<input
											type="text"
											id="expandable-text-expanded"
											bind:value={indicatorTextExpandedSetting}
											class="input-knob"
											style="width: 130px;"
										/>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(expandableCardCode, 25)}>
									{copiedIndex === 25 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{expandableCardCode}</code></pre>
						</div>
					</div>

					<!-- Deck Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Deck</h3>
							<p>{i18n.t('deckCard.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render">
									<Deck
										deck={mockDeck}
										index={0}
										folderColor={mockDeck.theme}
										bind:isPopoverOpen={isDeckPopoverOpen}
										bind:isMenuOpen={isDeckMenuOpen}
										stats={{ newCount: 3, dueCount: 14 }}
										modes={[
											{
												id: 'study',
												label:
													i18n.locale === 'pt'
														? 'Estudar'
														: i18n.locale === 'en'
															? 'Study'
															: 'Estudiar'
											},
											{
												id: 'review',
												label:
													i18n.locale === 'pt'
														? 'Revisar'
														: i18n.locale === 'en'
															? 'Review'
															: 'Revisar'
											}
										]}
										labels={{
											cards:
												i18n.locale === 'pt'
													? 'cartões'
													: i18n.locale === 'en'
														? 'cards'
														: 'tarjetas',
											due:
												i18n.locale === 'pt'
													? 'a revisar'
													: i18n.locale === 'en'
														? 'due'
														: 'a revisar',
											new: i18n.locale === 'pt' ? 'novos' : i18n.locale === 'en' ? 'new' : 'nuevos',
											duplicate:
												i18n.locale === 'pt'
													? 'Duplicar'
													: i18n.locale === 'en'
														? 'Duplicate'
														: 'Duplicar',
											edit:
												i18n.locale === 'pt' ? 'Editar' : i18n.locale === 'en' ? 'Edit' : 'Editar',
											delete:
												i18n.locale === 'pt'
													? 'Excluir'
													: i18n.locale === 'en'
														? 'Delete'
														: 'Eliminar'
										}}
										onSelect={() => {
											isDeckPopoverOpen = !isDeckPopoverOpen;
											isDeckMenuOpen = false;
											deckCardMessage =
												(i18n.locale === 'pt'
													? 'Estudar/Revisar clicado. Popover: '
													: i18n.locale === 'en'
														? 'Study/Review clicked. Popover: '
														: 'Estudiar/Revisar clicado. Popover: ') +
												(isDeckPopoverOpen
													? i18n.locale === 'pt'
														? 'Aberto'
														: i18n.locale === 'en'
															? 'Open'
															: 'Abierto'
													: i18n.locale === 'pt'
														? 'Fechado'
														: i18n.locale === 'en'
															? 'Closed'
															: 'Cerrado');
											addToast(deckCardMessage, 'info');
										}}
										onContextMenu={(e) => {
											e.preventDefault();
											isDeckMenuOpen = !isDeckMenuOpen;
											isDeckPopoverOpen = false;
											deckCardMessage =
												(i18n.locale === 'pt'
													? 'Menu de contexto (clique secundário). Menu: '
													: i18n.locale === 'en'
														? 'Context menu (right click). Menu: '
														: 'Menú de contexto (clic secundario). Menú: ') +
												(isDeckMenuOpen
													? i18n.locale === 'pt'
														? 'Aberto'
														: i18n.locale === 'en'
															? 'Open'
															: 'Abierto'
													: i18n.locale === 'pt'
														? 'Fechado'
														: i18n.locale === 'en'
															? 'Closed'
															: 'Cerrado');
										}}
										onOpenMenu={() => {
											isDeckMenuOpen = !isDeckMenuOpen;
											isDeckPopoverOpen = false;
											deckCardMessage =
												(i18n.locale === 'pt'
													? 'Menu de 3 pontos. Menu: '
													: i18n.locale === 'en'
														? '3-dots menu. Menu: '
														: 'Menú de 3 puntos. Menú: ') +
												(isDeckMenuOpen
													? i18n.locale === 'pt'
														? 'Aberto'
														: i18n.locale === 'en'
															? 'Open'
															: 'Abierto'
													: i18n.locale === 'pt'
														? 'Fechado'
														: i18n.locale === 'en'
															? 'Closed'
															: 'Cerrado');
										}}
										onDuplicate={() => {
											isDeckMenuOpen = false;
											isDeckPopoverOpen = false;
											deckCardMessage =
												i18n.locale === 'pt'
													? 'Baralho duplicado!'
													: i18n.locale === 'en'
														? 'Deck duplicated!'
														: '¡Baraja duplicada!';
											addToast(deckCardMessage, 'success');
										}}
										onEdit={() => {
											isDeckMenuOpen = false;
											isDeckPopoverOpen = false;
											deckCardMessage =
												i18n.locale === 'pt'
													? 'Editar baralho acionado'
													: i18n.locale === 'en'
														? 'Edit deck triggered'
														: 'Editar baraja activado';
										}}
										onDelete={() => {
											isDeckMenuOpen = false;
											isDeckPopoverOpen = false;
											deckCardMessage =
												i18n.locale === 'pt'
													? 'Excluir baralho acionado'
													: i18n.locale === 'en'
														? 'Delete deck triggered'
														: 'Eliminar baraja activado';
											addToast(deckCardMessage, 'warning');
										}}
										onStartSession={(mode) => {
											isDeckPopoverOpen = false;
											isDeckMenuOpen = false;
											deckCardMessage =
												(i18n.locale === 'pt'
													? 'Sessão iniciada no modo: '
													: i18n.locale === 'en'
														? 'Session started in mode: '
														: 'Sesión iniciada en el modo: ') +
												(mode === 'study'
													? i18n.locale === 'pt'
														? 'Estudar'
														: i18n.locale === 'en'
															? 'Study'
															: 'Estudiar'
													: i18n.locale === 'pt'
														? 'Revisar'
														: i18n.locale === 'en'
															? 'Review'
															: 'Revisar');
											addToast(deckCardMessage, 'success');
										}}
									/>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="deck-theme">{i18n.t('knobs.theme')}</label>
										<select id="deck-theme" bind:value={mockDeck.theme} class="select-knob">
											<option value="default">default</option>
											<option value="blue">blue</option>
											<option value="green">green</option>
											<option value="yellow">yellow</option>
											<option value="purple">purple</option>
											<option value="orange">orange</option>
											<option value="red">red</option>
										</select>
									</div>

									<div class="knob-row">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Menu suspenso:'
												: i18n.locale === 'en'
													? 'Dropdown menu:'
													: 'Menú desplegable:'}</span
										>
										<span class="status-badge"
											>{isDeckMenuOpen
												? i18n.locale === 'pt'
													? 'Aberto'
													: i18n.locale === 'en'
														? 'Open'
														: 'Abierto'
												: i18n.locale === 'pt'
													? 'Fechado'
													: i18n.locale === 'en'
														? 'Closed'
														: 'Cerrado'}</span
										>
									</div>
									<div class="knob-row">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Popover de estudo:'
												: i18n.locale === 'en'
													? 'Study popover:'
													: 'Popover de estudio:'}</span
										>
										<span class="status-badge"
											>{isDeckPopoverOpen
												? i18n.locale === 'pt'
													? 'Aberto'
													: i18n.locale === 'en'
														? 'Open'
														: 'Abierto'
												: i18n.locale === 'pt'
													? 'Fechado'
													: i18n.locale === 'en'
														? 'Closed'
														: 'Cerrado'}</span
										>
									</div>
									<div class="log-output">{deckCardMessage}</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(deckCodeString, 14)}>
									{copiedIndex === 14 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{deckCodeString}</code></pre>
						</div>
					</div>

					<!-- Folders Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Folders</h3>
							<p>
								{i18n.t('foldersList.description')}
							</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box" style="overflow: visible;">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render">
									<Folders
										items={mockFolders}
										bind:activeId={activeFolderId}
										layout={foldersLayout}
										labels={foldersLabels}
										onSelect={(id: string | null) => {
											const folder = mockFolders.find((f) => f.id === id);
											folderLog = folder
												? (i18n.locale === 'pt'
														? 'Pasta selecionada: '
														: i18n.locale === 'en'
															? 'Selected folder: '
															: 'Carpeta seleccionada: ') + folder.name
												: i18n.locale === 'pt'
													? 'Nenhuma pasta selecionada'
													: i18n.locale === 'en'
														? 'No folder selected'
														: 'Ninguna carpeta seleccionada';
										}}
										onCreateFolder={(name: string, color: string) => {
											const newFolder = { id: `fold-${Math.random()}`, name, color };
											mockFolders = [...mockFolders, newFolder];
											folderLog =
												(i18n.locale === 'pt'
													? 'Criou pasta: '
													: i18n.locale === 'en'
														? 'Created folder: '
														: 'Creó carpeta: ') + name;
											addToast(folderLog, 'success');
											return newFolder;
										}}
										onUpdateFolder={(id: string, name: string, color: string) => {
											mockFolders = mockFolders.map((f) =>
												f.id === id ? { ...f, name, color } : f
											);
											folderLog =
												(i18n.locale === 'pt'
													? 'Atualizou pasta para: '
													: i18n.locale === 'en'
														? 'Updated folder to: '
														: 'Actualizó carpeta a: ') + name;
											addToast(folderLog, 'info');
										}}
										onAction={(mode, folderId) => {
											if (mode === 'delete') {
												const folder = mockFolders.find((f) => f.id === folderId);
												mockFolders = mockFolders.filter((f) => f.id !== folderId);
												if (activeFolderId === folderId) {
													activeFolderId = null;
												}
												folderLog =
													(i18n.locale === 'pt'
														? 'Excluiu pasta: '
														: i18n.locale === 'en'
															? 'Deleted folder: '
															: 'Eliminó carpeta: ') + (folder?.name ?? '');
												addToast(folderLog, 'error');
											}
										}}
									/>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="folders-layout">{i18n.t('knobs.layout')}</label>
										<select id="folders-layout" bind:value={foldersLayout} class="select-knob">
											<option value="horizontal"
												>{i18n.locale === 'pt'
													? 'Horizontal (Scroll)'
													: i18n.locale === 'en'
														? 'Horizontal (Scroll)'
														: 'Horizontal (Desplazamiento)'}</option
											>
											<option value="wrap"
												>{i18n.locale === 'pt'
													? 'Ajustar (Wrap)'
													: i18n.locale === 'en'
														? 'Wrap'
														: 'Ajustar (Wrap)'}</option
											>
											<option value="grid"
												>{i18n.locale === 'pt'
													? 'Grade (Grid)'
													: i18n.locale === 'en'
														? 'Grid'
														: 'Cuadrícula (Grid)'}</option
											>
										</select>
									</div>
									<div class="log-output">{folderLog}</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(foldersCode, 15)}>
									{copiedIndex === 15 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{foldersCode}</code></pre>
						</div>
					</div>

					<!-- CardEditor Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>CardEditor</h3>
							<p>{i18n.t('cardEditorItem.description')}</p>
						</div>
						<div class="component-showcase-grid editor-showcase-grid">
							<div class="preview-box" style="overflow: visible;">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="editor-items-list editor-scroll-container"
									class:grid-cols-2={editorGridMode}
									role="list"
									style="width: 100%; padding: var(--space-sm) 0; min-height: 650px; max-height: 850px; overflow-y: auto;"
								>
									{#each editorCards as card, idx (card.id)}
										<div
											animate:flip={{ duration: 250, easing: quintOut }}
											class="card-editor-wrapper"
											draggable={true}
											role="listitem"
											class:dragging={draggedCardIndex === idx}
											ondragstart={(e) => {
												if (e.dataTransfer) {
													e.dataTransfer.effectAllowed = 'move';
													e.dataTransfer.setData('text/plain', idx.toString());
												}
												handleCardDragStart(idx);
											}}
											ondragover={(e) => {
												handleCardDragOver(e, idx);
											}}
											ondragend={handleCardDragEnd}
										>
											<CardEditor
												bind:value={editorCards[idx]}
												index={idx}
												totalCards={editorCards.length}
												onMove={moveCard}
												onDuplicate={duplicateCard}
												onRemove={removeCard}
												isDragging={draggedCardIndex === idx}
												onDragStart={handleCardDragStart}
												onDragOver={handleCardDragOver}
												onDragEnd={handleCardDragEnd}
												dragDisabled={true}
											/>
										</div>
									{/each}
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="editor-grid-mode">{i18n.t('knobs.columns')} 2</label>
										<input type="checkbox" id="editor-grid-mode" bind:checked={editorGridMode} />
									</div>
									<div class="knob-row">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Total de Cartões:'
												: i18n.locale === 'en'
													? 'Total Cards:'
													: 'Total de Tarjetas:'}</span
										>
										<span class="status-badge">{editorCards.length}</span>
									</div>
									<div class="log-output">{cardEditorLog}</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(cardEditorCode, 16)}>
									{copiedIndex === 16 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{cardEditorCode}</code></pre>
						</div>
					</div>
				{/if}

				{#if activeCategory === 'interactive'}
					<h2 class="category-title">{i18n.t('categories.interactive')}</h2>

					<!-- Terminal Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Terminal</h3>
							<p>{i18n.t('terminal.description')}</p>
						</div>
						<div class="component-showcase-grid layout-vertical">
							<div class="preview-box" style="min-height: 380px;">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render">
									<Terminal {initialVFS} bind:filesystem={terminalFilesystem} osMode="both" />
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<p>
										{i18n.locale === 'pt'
											? 'Suporta comandos nativos como:'
											: i18n.locale === 'en'
												? 'Supports native commands like:'
												: 'Soporta comandos nativos como:'} <code>ls</code>, <code>cd</code>,
										<code>mkdir</code>, <code>touch</code>, <code>cat</code>.
									</p>
									<div class="knob-row">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'VFS atualizado (JSON):'
												: i18n.locale === 'en'
													? 'Updated VFS (JSON):'
													: 'VFS actualizado (JSON):'}</span
										>
										<pre
											class="status-badge"
											style="font-family: monospace; white-space: pre-wrap; font-size: var(--text-sm); text-align: left; width: 100%; max-height: 200px; overflow-y: auto; padding: var(--space-sm);">{Object.keys(
												terminalFilesystem
											).length > 0
												? JSON.stringify(terminalFilesystem, null, 2)
												: i18n.locale === 'pt'
													? '(vazio)'
													: i18n.locale === 'en'
														? '(empty)'
														: '(vacío)'}</pre>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button
									onclick={() =>
										copyToClipboard(
											`import Terminal from '$lib/components/Terminal.svelte';\n\n<Terminal initialVFS={vfs} bind:filesystem={terminalFilesystem} osMode="both" />`,
											17
										)}
								>
									{copiedIndex === 17 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code
									>{`import Terminal from '$lib/components/Terminal.svelte';\n\n<Terminal initialVFS={vfs} bind:filesystem={terminalFilesystem} osMode="both" />`}</code
								></pre>
						</div>
					</div>

					<!-- DndOrder Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>DndOrder</h3>
							<p>{i18n.t('dndOrder.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render">
									<DndOrder
										options={['TypeScript', 'Svelte 5', 'Rust', 'Go']}
										bind:value={dndOrderValue}
										columns={dndOrderColumns}
										showNumbers={dndOrderShowNumbers}
									/>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="dnd-columns"
											>{i18n.locale === 'pt'
												? 'Colunas:'
												: i18n.locale === 'en'
													? 'Columns:'
													: 'Columnas:'}</label
										>
										<select id="dnd-columns" bind:value={dndOrderColumns} class="select-knob">
											<option value={1}
												>{i18n.locale === 'pt'
													? '1 Coluna'
													: i18n.locale === 'en'
														? '1 Column'
														: '1 Columna'}</option
											>
											<option value={2}
												>{i18n.locale === 'pt'
													? '2 Colunas'
													: i18n.locale === 'en'
														? '2 Columns'
														: '2 Columnas'}</option
											>
											<option value={3}
												>{i18n.locale === 'pt'
													? '3 Colunas'
													: i18n.locale === 'en'
														? '3 Columns'
														: '3 Columnas'}</option
											>
										</select>
									</div>
									<div class="knob-row">
										<label for="dnd-show-numbers">{i18n.t('knobs.show_numbers')}</label>
										<input
											type="checkbox"
											id="dnd-show-numbers"
											bind:checked={dndOrderShowNumbers}
										/>
									</div>
									<div class="log-output">
										{i18n.locale === 'pt' ? 'Ordem:' : i18n.locale === 'en' ? 'Order:' : 'Orden:'}
										{dndOrderValue.join(' → ')}
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(dndOrderCode, 18)}>
									{copiedIndex === 18 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{dndOrderCode}</code></pre>
						</div>
					</div>

					<!-- DndMatch Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>DndMatch</h3>
							<p>{i18n.t('dndMatch.description')}</p>
						</div>
						<div class="component-showcase-grid layout-vertical">
							<div class="preview-box" style="min-height: 380px;">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render">
									<DndMatch
										options={dndMatchOptions}
										buckets={dndMatchBuckets}
										bind:value={dndMatchValue}
									/>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<p>
										{i18n.locale === 'pt'
											? 'Categorize cada termo técnico na coluna adequada.'
											: i18n.locale === 'en'
												? 'Categorize each technical term in the appropriate column.'
												: 'Categorice cada término técnico en la columna adecuada.'}
									</p>
									<div class="log-output">
										Frontend: {dndMatchValue['Frontend']?.join(', ') ||
											(i18n.locale === 'pt'
												? 'Nenhum'
												: i18n.locale === 'en'
													? 'None'
													: 'Ninguno')}<br />
										Backend: {dndMatchValue['Backend']?.join(', ') ||
											(i18n.locale === 'pt' ? 'Nenhum' : i18n.locale === 'en' ? 'None' : 'Ninguno')}
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button
									onclick={() =>
										copyToClipboard(
											`import DndMatch from '$lib/components/DndMatch.svelte';\n\n<DndMatch\n\toptions={['React', 'NestJS']}\n\tbuckets={['Frontend', 'Backend']}\n\tbind:value={matches}\n/>`,
											19
										)}
								>
									{copiedIndex === 19 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code
									>{`import DndMatch from '$lib/components/DndMatch.svelte';\n\n<DndMatch\n\toptions={['React', 'NestJS']}\n\tbuckets={['Frontend', 'Backend']}\n\tbind:value={matches}\n/>`}</code
								></pre>
						</div>
					</div>
				{/if}

				{#if activeCategory === 'questions'}
					<h2 class="category-title">{i18n.t('categories.questions')}</h2>

					<!-- SingleChoice Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>SingleChoice</h3>
							<p>{i18n.t('singleChoice.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render">
									<SingleChoice
										options={choiceOptions}
										bind:value={singleChoiceValue}
										size={singleChoiceSize}
										columns={singleChoiceColumns}
									/>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="questions-size-single"
											>{i18n.locale === 'pt'
												? 'Tamanho (size):'
												: i18n.locale === 'en'
													? 'Size (size):'
													: 'Tamaño (size):'}</label
										>
										<select
											id="questions-size-single"
											bind:value={singleChoiceSize}
											class="select-knob"
										>
											<option value="sm">sm</option>
											<option value="md">md</option>
											<option value="lg">lg</option>
										</select>
									</div>
									<div class="knob-row">
										<label for="questions-cols-single"
											>{i18n.locale === 'pt'
												? 'Colunas (columns):'
												: i18n.locale === 'en'
													? 'Columns (columns):'
													: 'Columnas (columns):'}</label
										>
										<select
											id="questions-cols-single"
											bind:value={singleChoiceColumns}
											class="select-knob"
										>
											<option value={1}
												>{i18n.locale === 'pt'
													? '1 Coluna'
													: i18n.locale === 'en'
														? '1 Column'
														: '1 Columna'}</option
											>
											<option value={2}
												>{i18n.locale === 'pt'
													? '2 Colunas'
													: i18n.locale === 'en'
														? '2 Columns'
														: '2 Columnas'}</option
											>
											<option value={3}
												>{i18n.locale === 'pt'
													? '3 Colunas'
													: i18n.locale === 'en'
														? '3 Columns'
														: '3 Columnas'}</option
											>
										</select>
									</div>
									<div class="knob-row">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Selecionado:'
												: i18n.locale === 'en'
													? 'Selected:'
													: 'Seleccionado:'}</span
										>
										<span class="status-badge"
											>{singleChoiceValue ||
												(i18n.locale === 'pt'
													? 'Nenhum'
													: i18n.locale === 'en'
														? 'None'
														: 'Ninguno')}</span
										>
									</div>
									<Button variant="secondary" onclick={() => (singleChoiceValue = null)}
										>{i18n.locale === 'pt'
											? 'Limpar Seleção'
											: i18n.locale === 'en'
												? 'Clear Selection'
												: 'Limpiar Selección'}</Button
									>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button
									onclick={() =>
										copyToClipboard(
											`import SingleChoice from '$lib/components/questions/SingleChoice.svelte';\n\n<SingleChoice options={options} bind:value={selected} size="${singleChoiceSize}" columns={${singleChoiceColumns}} />`,
											20
										)}
								>
									{copiedIndex === 20 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code
									>{`import SingleChoice from '$lib/components/questions/SingleChoice.svelte';\n\n<SingleChoice options={options} bind:value={selected} size="${singleChoiceSize}" columns={${singleChoiceColumns}} />`}</code
								></pre>
						</div>
					</div>

					<!-- MultipleChoice Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>MultipleChoice</h3>
							<p>{i18n.t('multipleChoice.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render">
									<MultipleChoice
										options={choiceOptions}
										bind:value={multipleChoiceValue}
										size={multipleChoiceSize}
										columns={multipleChoiceColumns}
									/>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="questions-size-multi"
											>{i18n.locale === 'pt'
												? 'Tamanho (size):'
												: i18n.locale === 'en'
													? 'Size (size):'
													: 'Tamaño (size):'}</label
										>
										<select
											id="questions-size-multi"
											bind:value={multipleChoiceSize}
											class="select-knob"
										>
											<option value="sm">sm</option>
											<option value="md">md</option>
											<option value="lg">lg</option>
										</select>
									</div>
									<div class="knob-row">
										<label for="questions-cols-multi"
											>{i18n.locale === 'pt'
												? 'Colunas (columns):'
												: i18n.locale === 'en'
													? 'Columns (columns):'
													: 'Columnas (columns):'}</label
										>
										<select
											id="questions-cols-multi"
											bind:value={multipleChoiceColumns}
											class="select-knob"
										>
											<option value={1}
												>{i18n.locale === 'pt'
													? '1 Coluna'
													: i18n.locale === 'en'
														? '1 Column'
														: '1 Columna'}</option
											>
											<option value={2}
												>{i18n.locale === 'pt'
													? '2 Colunas'
													: i18n.locale === 'en'
														? '2 Columns'
														: '2 Columnas'}</option
											>
											<option value={3}
												>{i18n.locale === 'pt'
													? '3 Colunas'
													: i18n.locale === 'en'
														? '3 Columns'
														: '3 Columnas'}</option
											>
										</select>
									</div>
									<div class="knob-row">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Selecionados:'
												: i18n.locale === 'en'
													? 'Selected:'
													: 'Seleccionados:'}</span
										>
										<span class="status-badge" style="font-size: var(--text-xs);"
											>{multipleChoiceValue.join(', ') ||
												(i18n.locale === 'pt'
													? 'Nenhum'
													: i18n.locale === 'en'
														? 'None'
														: 'Ninguno')}</span
										>
									</div>
									<Button variant="secondary" onclick={() => (multipleChoiceValue = [])}
										>{i18n.locale === 'pt'
											? 'Limpar Tudo'
											: i18n.locale === 'en'
												? 'Clear All'
												: 'Limpiar Todo'}</Button
									>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button
									onclick={() =>
										copyToClipboard(
											`import MultipleChoice from '$lib/components/questions/MultipleChoice.svelte';\n\n<MultipleChoice options={options} bind:value={selectedArray} size="${multipleChoiceSize}" columns={${multipleChoiceColumns}} />`,
											21
										)}
								>
									{copiedIndex === 21 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code
									>{`import MultipleChoice from '$lib/components/questions/MultipleChoice.svelte';\n\n<MultipleChoice options={options} bind:value={selectedArray} size="${multipleChoiceSize}" columns={${multipleChoiceColumns}} />`}</code
								></pre>
						</div>
					</div>
				{/if}

				{#if activeCategory === 'data'}
					<h2 class="category-title">{i18n.t('categories.data')}</h2>

					<!-- Calendar Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Calendar</h3>
							<p>{i18n.t('calendar.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box" style="min-height: 240px;">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render full-width-render">
									<Calendar
										mode={calendarMode}
										{studyLogs}
										events={calendarEvents}
										bind:selectedDate={calendarSelectedDate}
										title={i18n.locale === 'pt'
											? 'Visualização de Frequência'
											: i18n.locale === 'en'
												? 'Frequency Visualization'
												: 'Visualización de Frecuencia'}
									/>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="calendar-mode">{i18n.t('knobs.mode')}</label>
										<select id="calendar-mode" bind:value={calendarMode} class="select-knob">
											<option value="calendar"
												>{i18n.locale === 'pt'
													? 'Calendário'
													: i18n.locale === 'en'
														? 'Calendar'
														: 'Calendario'}</option
											>
											<option value="heatmap">Heatmap</option>
										</select>
									</div>
									<div class="knob-row">
										<span class="knob-label"
											>{i18n.locale === 'pt'
												? 'Nível hoje:'
												: i18n.locale === 'en'
													? 'Activity level today:'
													: 'Nivel de hoy:'}</span
										>
										<Button
											variant="secondary"
											onclick={() => {
												const t = calendarSelectedDate
													? new Date(calendarSelectedDate + 'T12:00:00')
													: new Date();
												const dateStr = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
												studyLogs = { ...studyLogs, [dateStr]: (studyLogs[dateStr] || 0) + 2 };
												addToast(
													i18n.locale === 'pt'
														? `Atividade adicionada em ${dateStr}!`
														: i18n.locale === 'en'
															? `Activity added on ${dateStr}!`
															: `¡Actividad añadida el ${dateStr}!`,
													'success'
												);
											}}
											>{i18n.locale === 'pt'
												? 'Adicionar Atividade'
												: i18n.locale === 'en'
													? 'Add Activity'
													: 'Añadir Actividad'}</Button
										>
									</div>
									{#if calendarSelectedDate}
										<div class="knob-row">
											<span class="knob-label"
												>{i18n.locale === 'pt'
													? 'Selecionado:'
													: i18n.locale === 'en'
														? 'Selected:'
														: 'Seleccionado:'}</span
											>
											<span class="status-badge">{calendarSelectedDate}</span>
										</div>
									{/if}
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(calendarCode, 22)}>
									{copiedIndex === 22 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{calendarCode}</code></pre>
						</div>
					</div>

					<!-- Toast Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Toast</h3>
							<p>{i18n.t('toast.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div class="preview-render" style="flex-direction: column; gap: var(--space-sm);">
									<Button
										variant="success"
										onclick={() =>
											addToast(
												i18n.locale === 'pt'
													? 'Operação realizada com sucesso!'
													: i18n.locale === 'en'
														? 'Operation completed successfully!'
														: '¡Operación realizada con éxito!',
												'success'
											)}
										>{i18n.locale === 'pt'
											? 'Sucesso'
											: i18n.locale === 'en'
												? 'Success'
												: 'Éxito'}</Button
									>
									<Button
										variant="error"
										onclick={() =>
											addToast(
												i18n.locale === 'pt'
													? 'Ocorreu um erro no servidor.'
													: i18n.locale === 'en'
														? 'A server error occurred.'
														: 'Ocurrió un error en el servidor.',
												'error'
											)}
										>{i18n.locale === 'pt'
											? 'Erro'
											: i18n.locale === 'en'
												? 'Error'
												: 'Error'}</Button
									>
									<Button
										variant="secondary"
										style="background:#eab308; color:white;"
										onclick={() =>
											addToast(
												i18n.locale === 'pt'
													? 'Esta é uma notificação de aviso.'
													: i18n.locale === 'en'
														? 'This is a warning notification.'
														: 'Esta es una notificación de advertencia.',
												'warning'
											)}
										>{i18n.locale === 'pt'
											? 'Aviso'
											: i18n.locale === 'en'
												? 'Warning'
												: 'Aviso'}</Button
									>
									<Button
										variant="neutral"
										onclick={() =>
											addToast(
												i18n.locale === 'pt'
													? 'Dica rápida: Estude todos os dias.'
													: i18n.locale === 'en'
														? 'Quick tip: Study every day.'
														: 'Consejo rápido: Estudie todos los días.',
												'info'
											)}>Info</Button
									>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<p>
										{i18n.locale === 'pt'
											? 'As notificações aparecem de forma flutuante no canto inferior direito.'
											: i18n.locale === 'en'
												? 'Notifications appear floating in the bottom right corner.'
												: 'Las notificaciones aparecen flotando en la esquina inferior derecha.'}
									</p>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button
									onclick={() =>
										copyToClipboard(
											`import Toast from '$lib/components/Toast.svelte';\n\n<Toast toast={{ message: 'Notificação', type: 'success' }} />`,
											23
										)}
								>
									{copiedIndex === 23 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code
									>{`import Toast from '$lib/components/Toast.svelte';\n\n<Toast toast={{ message: 'Notificação', type: 'success' }} />`}</code
								></pre>
						</div>
					</div>

					<!-- Background Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>{i18n.t('background.title')}</h3>
							<p>{i18n.t('background.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div class="preview-box" style="position: relative; min-height: 220px;">
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="preview-render"
									style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; display: flex; align-items: center; justify-content: center; z-index: 1; overflow: hidden; border-radius: inherit;"
								>
									<Background
										pattern={localBgPattern}
										local={true}
										animate={localBgAnimate}
										direction={localBgDirection}
									/>
									<div
										style="position: relative; background: var(--bg-primary); border: var(--border-width) solid var(--border-color); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-sm); box-shadow: var(--shadow-sm); z-index: 5; font-weight: 800; font-family: var(--font-display); font-size: var(--text-sm);"
									>
										{i18n.locale === 'pt'
											? 'Visualização Local (local=true)'
											: i18n.locale === 'en'
												? 'Local View (local=true)'
												: 'Vista Local (local=true)'}
									</div>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div
									class="knobs-content"
									style="gap: var(--space-md); display: flex; flex-direction: column;"
								>
									<div class="knob-row">
										<label for="loc-pattern">{i18n.t('knobs.pattern')}</label>
										<select id="loc-pattern" bind:value={localBgPattern} class="select-knob">
											<option value="grid"
												>{i18n.locale === 'pt'
													? 'Grade (Grid)'
													: i18n.locale === 'en'
														? 'Grid'
														: 'Cuadrícula (Grid)'}</option
											>
											<option value="dots"
												>{i18n.locale === 'pt'
													? 'Pontos (Dots)'
													: i18n.locale === 'en'
														? 'Dots'
														: 'Puntos (Dots)'}</option
											>
											<option value="diagonal"
												>{i18n.locale === 'pt'
													? 'Diagonal'
													: i18n.locale === 'en'
														? 'Diagonal'
														: 'Diagonal'}</option
											>
											<option value="lines"
												>{i18n.locale === 'pt'
													? 'Linhas (Lines)'
													: i18n.locale === 'en'
														? 'Lines'
														: 'Líneas (Lines)'}</option
											>
											<option value="horizontal"
												>{i18n.locale === 'pt'
													? 'Horizontal'
													: i18n.locale === 'en'
														? 'Horizontal'
														: 'Horizontal'}</option
											>
										</select>
									</div>
									<div class="knob-row">
										<label for="loc-direction">{i18n.t('knobs.direction')}</label>
										<select
											id="loc-direction"
											bind:value={localBgDirection}
											class="select-knob"
											disabled={!localBgAnimate}
										>
											<option value="diagonal">Diagonal</option>
											<option value="diagonal-reverse"
												>{i18n.t('bgSwitcher.diagonal_reverse')}</option
											>
											<option value="up">{i18n.t('bgSwitcher.up')}</option>
											<option value="down">{i18n.t('bgSwitcher.down')}</option>
											<option value="left">{i18n.t('bgSwitcher.left')}</option>
											<option value="right">{i18n.t('bgSwitcher.right')}</option>
										</select>
									</div>
									<div class="knob-row">
										<label for="loc-animate">{i18n.t('knobs.animate')}</label>
										<input type="checkbox" id="loc-animate" bind:checked={localBgAnimate} />
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button
									onclick={() =>
										copyToClipboard(
											`<Background pattern="${localBgPattern}" local={true} animate={${localBgAnimate}} direction="${localBgDirection}" />`,
											24
										)}
								>
									{copiedIndex === 24 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code
									>{`<Background pattern="${localBgPattern}" local={true} animate={${localBgAnimate}} direction="${localBgDirection}" />`}</code
								></pre>
						</div>
					</div>

					<!-- Alert Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Alert</h3>
							<p>{i18n.t('alert.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div
								class="preview-box"
								style="justify-content: center; align-items: center; min-height: 180px;"
							>
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="preview-render"
									style="width: 100%; display: flex; flex-direction: column; gap: var(--space-sm);"
								>
									{#if isAlertActive}
										<Alert
											type={alertType}
											title={alertTitle}
											dismissible={alertDismissible}
											showIcon={alertShowIcon}
											ondismiss={() => {
												isAlertActive = false;
												addToast(
													i18n.locale === 'pt'
														? 'Alerta dispensado!'
														: i18n.locale === 'en'
															? 'Alert dismissed!'
															: '¡Alerta descartada!',
													'info'
												);
											}}
										>
											{i18n.locale === 'pt'
												? 'Esta é uma notificação brutalista contendo informações importantes para o usuário.'
												: i18n.locale === 'en'
													? 'This is a brutalist notification containing important information for the user.'
													: 'Esta es una notificación brutalista que contiene información importante para el usuario.'}
										</Alert>
									{:else}
										<Button size="sm" variant="secondary" onclick={() => (isAlertActive = true)}>
											{i18n.locale === 'pt'
												? 'Resetar Alerta'
												: i18n.locale === 'en'
													? 'Reset Alert'
													: 'Reiniciar Alerta'}
										</Button>
									{/if}
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="alert-title-input">Title:</label>
										<input
											type="text"
											id="alert-title-input"
											class="monsan-input"
											bind:value={alertTitle}
											style="width: 150px;"
										/>
									</div>
									<div class="knob-row">
										<label for="alert-type-select">{i18n.t('knobs.type')}</label>
										<select id="alert-type-select" bind:value={alertType} class="select-knob">
											<option value="info">info</option>
											<option value="success">success</option>
											<option value="warning">warning</option>
											<option value="error">error</option>
										</select>
									</div>
									<div class="knob-row">
										<label for="alert-dismissible-checkbox">Dismissible:</label>
										<input
											type="checkbox"
											id="alert-dismissible-checkbox"
											bind:checked={alertDismissible}
										/>
									</div>
									<div class="knob-row">
										<label for="alert-icon-checkbox">{i18n.t('knobs.show_icon')}</label>
										<input type="checkbox" id="alert-icon-checkbox" bind:checked={alertShowIcon} />
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(alertCode, 201)}>
									{copiedIndex === 201 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{alertCode}</code></pre>
						</div>
					</div>

					<!-- ProgressBar Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>ProgressBar</h3>
							<p>{i18n.t('progressBar.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div
								class="preview-box"
								style="justify-content: center; align-items: center; min-height: 180px;"
							>
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="preview-render"
									style="width: 100%; display: flex; flex-direction: column; gap: var(--space-md);"
								>
									<ProgressBar
										value={progressValue}
										variant={progressVariant}
										striped={progressStriped}
										animated={progressAnimated}
										showLabel={true}
									/>
									<div style="display: flex; gap: var(--space-sm); justify-content: center;">
										<Button
											size="sm"
											variant="secondary"
											disabled={progressValue <= 0}
											onclick={() => (progressValue = Math.max(0, progressValue - 10))}>-</Button
										>
										<Button
											size="sm"
											variant="secondary"
											disabled={progressValue >= 100}
											onclick={() => (progressValue = Math.min(100, progressValue + 10))}>+</Button
										>
									</div>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="prog-val-input">Value (0-100):</label>
										<input
											type="number"
											id="prog-val-input"
											class="monsan-input"
											bind:value={progressValue}
											min="0"
											max="100"
											style="width: 70px;"
										/>
									</div>
									<div class="knob-row">
										<label for="prog-variant-select">{i18n.t('knobs.variant')}</label>
										<select
											id="prog-variant-select"
											bind:value={progressVariant}
											class="select-knob"
										>
											<option value="primary">primary</option>
											<option value="success">success</option>
											<option value="warning">warning</option>
											<option value="error">error</option>
											<option value="info">info</option>
										</select>
									</div>
									<div class="knob-row">
										<label for="prog-striped-checkbox">Striped:</label>
										<input
											type="checkbox"
											id="prog-striped-checkbox"
											bind:checked={progressStriped}
										/>
									</div>
									<div class="knob-row">
										<label for="prog-animated-checkbox">Animated:</label>
										<input
											type="checkbox"
											id="prog-animated-checkbox"
											bind:checked={progressAnimated}
										/>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(progressCode, 202)}>
									{copiedIndex === 202 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{progressCode}</code></pre>
						</div>
					</div>

					<!-- Avatar Showcase -->
					<div class="component-card panel">
						<div class="component-info">
							<h3>Avatar</h3>
							<p>{i18n.t('avatar.description')}</p>
						</div>
						<div class="component-showcase-grid">
							<div
								class="preview-box"
								style="justify-content: center; align-items: center; min-height: 180px;"
							>
								<span class="box-label">{i18n.t('common.preview')}</span>
								<div
									class="preview-render"
									style="display: flex; gap: var(--space-md); align-items: center; justify-content: center;"
								>
									<div
										style="display: flex; flex-direction: column; align-items: center; gap: var(--space-xs);"
									>
										<span
											style="font-size: var(--text-xs); font-weight: 700; color: var(--text-secondary);"
											>Image</span
										>
										<Avatar
											src={avatarSrc}
											name={avatarName}
											size={avatarSize}
											shape={avatarShape}
										/>
									</div>
									<div
										style="display: flex; flex-direction: column; align-items: center; gap: var(--space-xs);"
									>
										<span
											style="font-size: var(--text-xs); font-weight: 700; color: var(--text-secondary);"
											>Fallback (Initials)</span
										>
										<Avatar name={avatarName} size={avatarSize} shape={avatarShape} />
									</div>
								</div>
							</div>
							<div class="knobs-box">
								<span class="box-label">{i18n.t('common.controls')}</span>
								<div class="knobs-content">
									<div class="knob-row">
										<label for="av-name-input">Name:</label>
										<input
											type="text"
											id="av-name-input"
											class="monsan-input"
											bind:value={avatarName}
											style="width: 130px;"
										/>
									</div>
									<div class="knob-row">
										<label for="av-src-input">Src URL:</label>
										<input
											type="text"
											id="av-src-input"
											class="monsan-input"
											bind:value={avatarSrc}
											style="width: 130px;"
										/>
									</div>
									<div class="knob-row">
										<label for="av-size-select">{i18n.t('knobs.size')}</label>
										<select id="av-size-select" bind:value={avatarSize} class="select-knob">
											<option value="sm">sm (32px)</option>
											<option value="md">md (48px)</option>
											<option value="lg">lg (64px)</option>
										</select>
									</div>
									<div class="knob-row">
										<label for="av-shape-select">Shape:</label>
										<select id="av-shape-select" bind:value={avatarShape} class="select-knob">
											<option value="circle">circle</option>
											<option value="square">square</option>
										</select>
									</div>
								</div>
							</div>
						</div>
						<div class="code-container">
							<div class="code-header">
								<span>Svelte 5</span>
								<button onclick={() => copyToClipboard(avatarCode, 203)}>
									{copiedIndex === 203 ? i18n.t('common.copied') : i18n.t('common.copy')}
								</button>
							</div>
							<pre><code>{avatarCode}</code></pre>
						</div>
					</div>
				{/if}
			</section>
			<Search
				bind:open={isSearchOpen}
				items={mockSearchItems}
				title={i18n.locale === 'pt' ? 'Buscar' : i18n.locale === 'en' ? 'Search' : 'Buscar'}
				placeholder={i18n.locale === 'pt'
					? 'Buscar...'
					: i18n.locale === 'en'
						? 'Search...'
						: 'Buscar...'}
				noResultsMessage={i18n.locale === 'pt'
					? 'Nenhum resultado encontrado'
					: i18n.locale === 'en'
						? 'No results found'
						: 'Ningún resultado encontrado'}
				onSelectResult={(item) => {
					searchResultText = `${item.name} (${item.type})`;
					addToast(
						(i18n.locale === 'pt'
							? 'Selecionado: '
							: i18n.locale === 'en'
								? 'Selected: '
								: 'Seleccionado: ') + item.name,
						'success'
					);
				}}
			/>

			<Dialog
				bind:open={isFoldersDialogOpen}
				size="md"
				title={i18n.locale === 'pt'
					? 'Gerenciar Pastas'
					: i18n.locale === 'en'
						? 'Manage Folders'
						: 'Gestionar Carpetas'}
			>
				<div
					style="padding: var(--space-xs) 0; display: flex; flex-direction: column; gap: var(--space-md);"
				>
					<Folders
						items={mockFolders}
						bind:activeId={activeFolderId}
						bind:showCreateModal={showFoldersCreateModal}
						layout="wrap"
						hideAddButton={false}
						labels={foldersLabels}
						onSelect={(id: string | null) => {
							const folder = mockFolders.find((f) => f.id === id);
							folderLog = folder
								? (i18n.locale === 'pt'
										? 'Pasta selecionada: '
										: i18n.locale === 'en'
											? 'Selected folder: '
											: 'Carpeta seleccionada: ') + folder.name
								: i18n.locale === 'pt'
									? 'Nenhuma pasta selecionada'
									: i18n.locale === 'en'
										? 'No folder selected'
										: 'Ninguna carpeta seleccionada';
							addToast(folderLog, 'info');
						}}
						onCreateFolder={(name: string, color: string) => {
							const newFolder = { id: `fold-${Math.random()}`, name, color };
							mockFolders = [...mockFolders, newFolder];
							folderLog =
								(i18n.locale === 'pt'
									? 'Criou pasta: '
									: i18n.locale === 'en'
										? 'Created folder: '
										: 'Creó carpeta: ') + name;
							addToast(folderLog, 'success');
							return newFolder;
						}}
						onUpdateFolder={(id: string, name: string, color: string) => {
							mockFolders = mockFolders.map((f) => (f.id === id ? { ...f, name, color } : f));
							folderLog =
								(i18n.locale === 'pt'
									? 'Atualizou pasta para: '
									: i18n.locale === 'en'
										? 'Updated folder to: '
										: 'Actualizó carpeta a: ') + name;
							addToast(folderLog, 'info');
						}}
						onAction={(action: 'edit' | 'delete', id: string) => {
							if (action === 'delete') {
								if (mockFolders.length <= 1) {
									addToast(
										i18n.locale === 'pt'
											? 'Você deve manter pelo menos uma pasta.'
											: i18n.locale === 'en'
												? 'You must keep at least one folder.'
												: 'Debe mantener al menos una carpeta.',
										'warning'
									);
									return;
								}
								mockFolders = mockFolders.filter((f) => f.id !== id);
								if (activeFolderId === id) activeFolderId = null;
								folderLog =
									i18n.locale === 'pt'
										? 'Excluiu pasta.'
										: i18n.locale === 'en'
											? 'Deleted folder.'
											: 'Eliminó carpeta.';
								addToast(
									i18n.locale === 'pt'
										? 'Pasta excluída!'
										: i18n.locale === 'en'
											? 'Folder deleted!'
											: '¡Carpeta eliminada!',
									'info'
								);
							}
						}}
					/>
					<div style="display: flex; justify-content: flex-end; margin-top: var(--space-xs);">
						<Button onclick={() => (isFoldersDialogOpen = false)}
							>{i18n.locale === 'pt' ? 'Fechar' : i18n.locale === 'en' ? 'Close' : 'Cerrar'}</Button
						>
					</div>
				</div>
			</Dialog>

			<Dialog
				bind:open={isFilterDialogOpen}
				size="sm"
				title={i18n.locale === 'pt'
					? 'Filtrar Baralhos'
					: i18n.locale === 'en'
						? 'Filter Decks'
						: 'Filtrar Barajas'}
			>
				<div style="display: flex; flex-direction: column; gap: var(--space-md);">
					<p style="font-size: var(--text-sm); color: var(--text-secondary);">
						{i18n.locale === 'pt'
							? 'Escolha um filtro de exibição para a demonstração:'
							: i18n.locale === 'en'
								? 'Choose a display filter for the demo:'
								: 'Elija un filtro de visualización para la demostración:'}
					</p>
					<div style="display: flex; flex-direction: column; gap: var(--space-sm);">
						{#each ['todos', 'estudando', 'concluidos'] as filter (filter)}
							<button
								class="filter-select-btn"
								class:active={activeFilter === filter}
								onclick={() => {
									activeFilter = filter;
									addToast(
										(i18n.locale === 'pt'
											? 'Filtro alterado para: '
											: i18n.locale === 'en'
												? 'Filter changed to: '
												: 'Filtro cambiado a: ') +
											(filter === 'todos'
												? i18n.locale === 'pt'
													? 'todos'
													: i18n.locale === 'en'
														? 'all'
														: 'todos'
												: filter === 'estudando'
													? i18n.locale === 'pt'
														? 'estudando'
														: i18n.locale === 'en'
															? 'studying'
															: 'estudiando'
													: i18n.locale === 'pt'
														? 'concluídos'
														: i18n.locale === 'en'
															? 'completed'
															: 'completados'),
										'info'
									);
									isFilterDialogOpen = false;
								}}
							>
								{filter === 'todos'
									? i18n.locale === 'pt'
										? 'Todos'
										: i18n.locale === 'en'
											? 'All'
											: 'Todos'
									: filter === 'estudando'
										? i18n.locale === 'pt'
											? 'Estudando'
											: i18n.locale === 'en'
												? 'Studying'
												: 'Estudiando'
										: i18n.locale === 'pt'
											? 'Concluídos'
											: i18n.locale === 'en'
												? 'Completed'
												: 'Completados'}
							</button>
						{/each}
					</div>
					<div style="display: flex; justify-content: flex-end; margin-top: var(--space-xs);">
						<Button onclick={() => (isFilterDialogOpen = false)}
							>{i18n.locale === 'pt' ? 'Fechar' : i18n.locale === 'en' ? 'Close' : 'Cerrar'}</Button
						>
					</div>
				</div>
			</Dialog>
		</div>
		<Credits
			authorName="Monsan"
			authorLink="https://github.com/lucasmonsan"
			copyright={i18n.locale === 'pt'
				? '© 2026 MonsanUI. Todos os direitos reservados.'
				: i18n.locale === 'en'
					? '© 2026 MonsanUI. All rights reserved.'
					: '© 2026 MonsanUI. Todos los derechos reservados.'}
			placement="page-bottom"
			variant="compact"
		/>
		<Loading active={isDemoLoadingActive} message={demoLoadingMessage} />

		{#if showSplashPreview}
			<SplashScreen
				appName="Showcase App"
				logoSrc="/favicon.svg"
				copyright="© 2026 Showcase App. Todos os direitos reservados."
				{creditsVariant}
				forceVisible={true}
			>
				<div
					style="display: flex; flex-direction: column; align-items: center; gap: var(--space-xl); text-align: center;"
				>
					<div
						style="display: flex; align-items: center; justify-content: center; background-color: var(--bg-secondary); border: var(--border-width) solid var(--border-color); box-shadow: var(--shadow-sm); padding: var(--space-sm); border-radius: var(--radius-md); width: 80px; height: 80px;"
					>
						<svg
							viewBox="0 0 24 24"
							width="48"
							height="48"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							style="color: var(--accent-primary);"
						>
							<polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
							<line x1="12" y1="22" x2="12" y2="15.5"></line>
							<polyline points="22 8.5 12 15.5 2 8.5"></polyline>
							<polyline points="2 15.5 12 8.5 22 15.5"></polyline>
							<line x1="12" y1="2" x2="12" y2="8.5"></line>
						</svg>
					</div>
					<h1
						style="font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 900; text-transform: uppercase; margin: 0; letter-spacing: -0.02em; color: var(--text-primary);"
					>
						Showcase App
					</h1>
					<Button variant="primary" onclick={() => (showSplashPreview = false)}>
						Fechar Preview
					</Button>
				</div>
			</SplashScreen>
		{/if}
	</div>
</main>

<style>
	.showcase-container {
		max-width: var(--container-max-width);
		margin: 0 auto;
		padding: 0 var(--space-md);
		display: flex;
		flex-direction: column;
		height: 100vh;
		max-height: 100vh;
		overflow: hidden;
		position: relative;
		z-index: 1;
	}

	.showcase-scroll-container {
		flex-grow: 1;
		overflow-y: auto;
		padding-top: var(--space-md);
		padding-bottom: 0;
		display: flex;
		flex-direction: column;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.showcase-scroll-container::-webkit-scrollbar {
		display: none;
	}

	.showcase-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-lg);
		background: var(--bg-secondary);
		border-radius: var(--radius-md);
		flex-wrap: wrap;
		gap: var(--space-md);
	}

	.header-left {
		flex: 1;
		min-width: 250px;
	}

	.header-left h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		color: var(--accent-primary);
		font-weight: 900;
	}

	.header-left p {
		margin: var(--space-xs) 0 0 0;
		font-size: var(--text-sm);
		color: var(--text-secondary);
		font-family: var(--font-body);
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		flex-shrink: 0;
	}

	.showcase-layout {
		display: block;
		width: 100%;
		flex-grow: 1;
		padding-bottom: var(--space-lg);
	}

	.main-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

	.category-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		margin: 0 0 var(--space-sm) 0;
		color: var(--text-primary);
		border-bottom: 3px solid var(--accent-primary);
		padding-bottom: var(--space-xs);
		display: inline-block;
		font-weight: 900;
	}

	.component-card {
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		padding: var(--space-xl);
		box-shadow: var(--shadow-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.component-info h3 {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-xl);
		color: var(--text-primary);
		font-weight: 900;
	}

	.component-info p {
		margin: var(--space-xs) 0 0 0;
		font-size: var(--text-sm);
		color: var(--text-secondary);
		font-family: var(--font-body);
	}

	.component-showcase-grid {
		display: grid;
		grid-template-columns: 1.5fr 1fr;
		gap: var(--space-lg);
	}

	.component-showcase-grid.layout-vertical {
		grid-template-columns: 1fr;
	}

	@media (max-width: 768px) {
		.component-showcase-grid,
		.component-showcase-grid.layout-vertical {
			grid-template-columns: 1fr;
		}
	}

	.preview-box,
	.knobs-box {
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		padding: var(--space-md);
		background: var(--bg-secondary);
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		min-height: 180px;
		min-width: 0;
	}

	.box-label {
		position: absolute;
		top: -10px;
		left: var(--space-md);
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		padding: 1px var(--space-xs);
		font-size: calc(var(--base) * 0.7);
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0;
		color: var(--text-secondary);
		z-index: 10;
	}

	.preview-render {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		width: 100%;
		min-width: 0;
	}

	.knobs-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		justify-content: center;
		height: 100%;
		font-family: var(--font-body);
	}

	.knob-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.knob-row label {
		font-size: var(--text-sm);
		font-weight: bold;
	}

	.select-knob {
		height: 32px;
		padding: 0 var(--space-sm);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		background: var(--bg-primary);
		color: var(--text-primary);
		font-family: inherit;
		font-weight: bold;
		cursor: pointer;
	}

	.input-knob {
		height: 32px;
		padding: 0 var(--space-sm);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		background: var(--bg-primary);
		color: var(--text-primary);
		font-family: inherit;
		font-weight: bold;
		width: 120px;
	}

	.status-badge {
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		padding: 2px var(--space-sm);
		font-size: var(--text-sm);
		font-weight: bold;
		border-radius: var(--radius-sm);
	}

	.code-container {
		background: #1c1917;
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		overflow: hidden;
		box-shadow: var(--shadow-sm);
	}

	.code-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-xs) var(--space-md);
		background: #2e2a27;
		border-bottom: 2px solid var(--border-color);
		color: #e7e5e4;
		font-size: var(--text-xs);
		font-family: var(--font-body);
		font-weight: bold;
	}

	.code-header button {
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		color: var(--text-primary);
		padding: 2px var(--space-sm);
		font-size: var(--text-xs);
		cursor: pointer;
		font-weight: bold;
		box-shadow: 1px 1px 0px var(--border-color);
		transition: all 0.1s;
	}

	.code-header button:hover {
		transform: translate(-1px, -1px);
		box-shadow: 2px 2px 0px var(--border-color);
	}

	.code-container pre {
		margin: 0;
		padding: var(--space-md);
		overflow-x: auto;
	}

	.code-container code {
		font-family: 'Courier New', Courier, monospace;
		font-size: var(--text-sm);
		color: #f5f5f4;
		white-space: pre;
	}

	.toast-container {
		position: fixed;
		bottom: var(--space-lg);
		right: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		z-index: 9999;
		pointer-events: none;
	}

	.full-width-render {
		width: 100%;
		min-width: 0;
	}

	.log-output {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		margin-top: var(--space-xs);
		word-break: break-all;
	}

	.showcase-top-bar {
		position: relative;
		flex-shrink: 0;
		padding-top: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		z-index: 100;
		transition: box-shadow 0.2s ease;
	}

	.showcase-top-bar.is-scrolled {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}

	.editor-items-list {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
		max-width: 650px;
		margin: 0 auto;
		width: 100%;
		align-items: start;
	}

	.editor-items-list.grid-cols-2 {
		grid-template-columns: 1fr 1fr;
		max-width: 100%;
	}

	.editor-scroll-container {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.editor-scroll-container::-webkit-scrollbar {
		display: none;
	}

	.card-editor-wrapper {
		display: flex;
		width: 100%;
		transition: opacity 0.2s ease;
	}

	@media (max-width: 768px) {
		.editor-items-list.grid-cols-2 {
			grid-template-columns: 1fr;
		}
	}

	.filter-select-btn {
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		padding: var(--space-sm) var(--space-md);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-sm);
		color: var(--text-primary);
		cursor: pointer;
		border-radius: var(--radius-sm);
		box-shadow: var(--shadow-sm);
		transition: all 0.1s var(--ease-out);
		text-align: left;
		width: 100%;
	}

	.filter-select-btn:hover {
		background: var(--bg-secondary);
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--border-color);
	}

	.filter-select-btn.active {
		background: var(--accent-primary);
		color: var(--bg-primary);
		transform: translate(1px, 1px);
		box-shadow: 1px 1px 0px var(--border-color);
	}

	.card-content-front,
	.card-content-back {
		color: var(--text-primary);
		font-family: var(--font-body);
	}

	.icons-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
		gap: var(--space-md);
		width: 100%;
	}

	.icon-showcase-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		padding: var(--space-sm);
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.1s var(--ease-out);
	}

	.icon-showcase-btn:hover {
		transform: translate(-2px, -2px);
		box-shadow: 3px 3px 0 var(--border-color);
		background: var(--bg-secondary);
	}

	.icon-showcase-btn.active {
		border-color: var(--accent-primary);
		background: var(--bg-secondary);
		box-shadow: 2px 2px 0 var(--accent-primary);
		transform: translate(-1px, -1px);
	}

	.icon-showcase-btn.active:hover {
		box-shadow: 3px 3px 0 var(--accent-primary);
		transform: translate(-2px, -2px);
	}

	.icon-showcase-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-primary);
	}

	.icon-showcase-btn.active .icon-showcase-icon {
		color: var(--accent-primary);
	}

	.icon-showcase-label {
		font-size: 10px;
		font-family: var(--font-display);
		font-weight: 700;
		word-break: break-all;
		text-align: center;
		color: var(--text-primary);
	}

	/* Estilos para controle do menu de navegação de categorias no topo */
	.category-navigation-header {
		display: block;
		max-width: 220px;
		width: 100%;
		min-width: 140px;
	}

	/* Melhorias no layout do CardEditorItem */
	.editor-showcase-grid {
		grid-template-columns: 2fr 1fr;
	}

	@media (max-width: 768px) {
		.editor-showcase-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

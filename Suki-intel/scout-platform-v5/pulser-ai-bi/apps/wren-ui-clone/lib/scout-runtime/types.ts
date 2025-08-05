/**
 * Scout Runtime Type Definitions
 * Complete parity with Tableau Extensions API plus enhancements
 */

// Core Enums matching Tableau exactly
export enum AnalyticsObjectType {
  Cluster = "cluster",
  Forecast = "forecast",
  TrendLine = "trend-line"
}

export enum AnnotationType {
  Mark = "mark",
  Point = "point",
  Area = "area"
}

export enum ColumnType {
  Discrete = "discrete",
  Continuous = "continuous",
  Unknown = "unknown"
}

export enum DashboardObjectType {
  Blank = "blank",
  Worksheet = "worksheet",
  QuickFilter = "quick-filter",
  ParameterControl = "parameter-control",
  PageFilter = "page-filter",
  Legend = "legend",
  Title = "title",
  Text = "text",
  Image = "image",
  WebPage = "web-page",
  Extension = "extension",
  // Scout additions
  KPICard = "kpi-card",
  AIInsightPanel = "ai-insight-panel"
}

export enum DashboardObjectVisibilityType {
  Show = "show",
  Hide = "hide"
}

export enum DataType {
  String = "string",
  Int = "int",
  Float = "float",
  Bool = "bool",
  Date = "date",
  DateTime = "date-time",
  Spatial = "spatial",
  Unknown = "unknown"
}

export enum FilterType {
  Categorical = "categorical",
  Range = "range",
  Hierarchical = "hierarchical",
  RelativeDate = "relative-date"
}

export enum FilterUpdateType {
  Add = "add",
  All = "all",
  Replace = "replace",
  Remove = "remove"
}

export enum MarkType {
  Bar = "bar",
  Line = "line",
  Area = "area",
  Square = "square",
  Circle = "circle",
  Shape = "shape",
  Text = "text",
  Map = "map",
  Pie = "pie",
  GanttBar = "gantt-bar",
  Polygon = "polygon",
  Heatmap = "heatmap",
  VizExtension = "viz-extension"
}

export enum SelectionUpdateType {
  Replace = "select-replace",
  Add = "select-add",
  Remove = "select-remove"
}

export enum SheetType {
  Dashboard = "dashboard",
  Story = "story",
  Worksheet = "worksheet"
}

// Core Interfaces

export interface ContextMenuCallbacks {
  [key: string]: () => void;
}

export interface DataValue {
  value: any;
  formattedValue?: string;
  nativeValue?: any;
}

export interface Column {
  fieldName: string;
  dataType: DataType;
  isReferenced: boolean;
  index: number;
}

export interface DataTable {
  name: string;
  data: DataValue[][];
  columns: Column[];
  totalRowCount: number;
  isTotalRowCountLimited: boolean;
}

export interface Filter {
  worksheetName: string;
  fieldName: string;
  filterType: FilterType;
  fieldId: string;
  appliedValues?: DataValue[];
  isExcludeMode?: boolean;
  domainMin?: DataValue;
  domainMax?: DataValue;
}

export interface Parameter {
  id: string;
  name: string;
  currentValue: DataValue;
  dataType: DataType;
  allowableValues?: {
    type: 'all' | 'list' | 'range';
    allowableValues?: DataValue[];
    minValue?: DataValue;
    maxValue?: DataValue;
    stepSize?: number;
    dateStepPeriod?: string;
  };
}

export interface Mark {
  tupleId?: number;
  pairs: Array<{
    fieldName: string;
    value: DataValue;
  }>;
}

export interface MarksCollection {
  data: Mark[];
}

export interface Worksheet {
  name: string;
  sheetType: SheetType;
  size: {
    behavior: string;
    maxSize?: number;
    minSize?: number;
  };
  
  // Methods
  getDataSourcesAsync(): Promise<DataSource[]>;
  getFiltersAsync(): Promise<Filter[]>;
  getSummaryDataAsync(options?: GetDataOptions): Promise<DataTable>;
  getUnderlyingDataAsync(options?: GetDataOptions): Promise<DataTable>;
  getSelectedMarksAsync(): Promise<MarksCollection>;
  selectMarksAsync(
    fieldName: string,
    values: any[],
    updateType: SelectionUpdateType
  ): Promise<void>;
  clearSelectedMarksAsync(): Promise<void>;
}

export interface Dashboard {
  name: string;
  worksheets: Worksheet[];
  objects: DashboardObject[];
  sheetType: SheetType.Dashboard;
  size: {
    width: number;
    height: number;
  };
  
  // Methods
  getParametersAsync(): Promise<Parameter[]>;
  getFiltersAsync(): Promise<Filter[]>;
}

export interface DashboardObject {
  id: number;
  type: DashboardObjectType;
  name: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  worksheet?: Worksheet;
  isFloating: boolean;
  isVisible: boolean;
  
  // Scout enhancements
  zoneConfig?: ZoneConfig;
}

export interface DataSource {
  id: string;
  name: string;
  fields: Field[];
  isExtract: boolean;
  
  // Methods
  getConnectionSummariesAsync(): Promise<ConnectionSummary[]>;
  getActiveTablesAsync(): Promise<TableSummary[]>;
  refreshAsync(): Promise<void>;
}

export interface Field {
  id: string;
  name: string;
  description?: string;
  aggregation?: string;
  columnType: ColumnType;
  dataType: DataType;
  role?: 'dimension' | 'measure';
}

export interface ConnectionSummary {
  name: string;
  id: string;
  serverURI?: string;
  type: string;
}

export interface TableSummary {
  name: string;
  id: string;
  connectionId: string;
  customSQL?: string;
}

export interface GetDataOptions {
  maxRows?: number;
  ignoreAliases?: boolean;
  ignoreSelection?: boolean;
  includeAllColumns?: boolean;
}

// Main namespace interfaces

export interface DashboardContent {
  dashboard: Dashboard;
}

export interface Environment {
  apiVersion: string;
  mode: 'authoring' | 'viewing' | 'server';
  locale: string;
  operatingSystem: string;
  tableauVersion?: string;
  dashboardVersion?: string;
  
  // Scout additions
  user?: {
    id: string;
    name: string;
    email: string;
  };
  organization?: {
    id: string;
    name: string;
  };
  theme?: 'light' | 'dark';
  
  // Methods
  initialize(): Promise<void>;
}

export interface Settings {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
  getAll(): { [key: string]: string };
  saveAsync(): Promise<void>;
  erase(key: string): void;
  
  // Scout additions
  onChange(callback: (key: string, value: string) => void): void;
  offChange(callback: (key: string, value: string) => void): void;
}

export interface UI {
  displayDialogAsync(
    url: string,
    payload?: string,
    options?: DialogOptions
  ): Promise<string>;
  closeDialog(payload?: string): void;
  
  // Scout additions
  showModal(options: ModalOptions): Promise<any>;
  showToast(options: ToastOptions): void;
  showContextMenu(options: ContextMenuOptions): void;
}

export interface DialogOptions {
  width?: number;
  height?: number;
  style?: 'window' | 'modal' | 'modeless';
}

// Scout-specific types

export interface ZoneConfig {
  type: 'chart' | 'kpi' | 'filter' | 'parameter' | 'ai-insight';
  chartType?: ChartType;
  dataSource?: string;
  refreshInterval?: number;
  aiEnabled?: boolean;
  drillDownEnabled?: boolean;
  exportEnabled?: boolean;
  customConfig?: any;
}

export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  AREA = 'area',
  PIE = 'pie',
  DONUT = 'donut',
  SCATTER = 'scatter',
  HEATMAP = 'heatmap',
  TREEMAP = 'treemap',
  SANKEY = 'sankey',
  FUNNEL = 'funnel',
  GAUGE = 'gauge',
  RADAR = 'radar',
  WATERFALL = 'waterfall',
  BOXPLOT = 'boxplot',
  CANDLESTICK = 'candlestick',
  CHOROPLETH = 'choropleth',
  BUBBLE = 'bubble',
  SUNBURST = 'sunburst',
  NETWORK = 'network',
  CALENDAR = 'calendar'
}

export interface ModalOptions {
  title: string;
  content: React.ReactNode | string;
  actions?: Array<{
    label: string;
    action: () => void | Promise<void>;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  size?: 'small' | 'medium' | 'large';
  closeOnOverlayClick?: boolean;
}

export interface ToastOptions {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface ContextMenuOptions {
  items: Array<{
    label: string;
    action: () => void;
    icon?: string;
    disabled?: boolean;
    separator?: boolean;
  }>;
  position: { x: number; y: number };
}

export interface VizImageInputSpec {
  description?: string;
  data: {
    values: any[];
  };
  mark: MarkType;
  encoding: {
    columns?: { field: string; type: string };
    rows?: { field: string; type: string };
    color?: { field: string; type: string };
    size?: { field: string; type: string };
    sort?: {
      field: string;
      sortby?: string;
      direction?: 'ascending' | 'descending';
    };
  };
}

export interface ScoutWorkbook {
  name: string;
  activeSheet: Worksheet | Dashboard;
  publishedSheetsInfo: Array<{
    name: string;
    sheetType: SheetType;
    isActive: boolean;
    isHidden: boolean;
    index: number;
  }>;
  
  // Methods
  activateSheetAsync(sheetNameOrIndex: string | number): Promise<Worksheet | Dashboard>;
  revertAllAsync(): Promise<void>;
  initialize(): Promise<void>;
  
  // Scout additions
  getTheme(): 'light' | 'dark';
  setTheme(theme: 'light' | 'dark'): void;
}

// Main Extensions interface
export interface ScoutExtensions {
  initializeAsync(contextMenuCallbacks?: ContextMenuCallbacks): Promise<void>;
  initializeDialogAsync(): Promise<string>;
  dashboardContent?: DashboardContent;
  environment: Environment;
  settings: Settings;
  ui: UI;
  workbook?: ScoutWorkbook;
  dashboardObjectId?: number;
  createVizImageAsync(inputSpec: VizImageInputSpec): Promise<string>;
  setClickThroughAsync(clickThroughEnabled: boolean): Promise<void>;
  
  // Scout additions
  requestAIInsight(context: any): Promise<any>;
  exportDashboard(format: 'pdf' | 'png' | 'xlsx' | 'pptx'): Promise<Blob>;
  enableCollaboration(options?: any): Promise<void>;
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
  emit(event: string, ...args: any[]): void;
}
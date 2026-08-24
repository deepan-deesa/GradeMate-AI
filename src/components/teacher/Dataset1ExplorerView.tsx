import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Database, 
  BrainCircuit, 
  Search, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  CheckCircle, 
  Sparkles, 
  ArrowRight, 
  Filter, 
  Loader2 
} from 'lucide-react';

interface DatasetItem {
  id: string;
  index: number;
  expression: string;
  answer: string;
  imageFilename: string | null;
  imageUrl: string | null;
}

export const Dataset1ExplorerView: React.FC = () => {
  const { fetchDataset1, analyzeHandwriting, setSelectedSubmission, setActiveView, addToast, dbState } = useApp();
  const [items, setItems] = useState<DatasetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'with_image' | 'excel_only'>('all');
  const [selectedItem, setSelectedItem] = useState<DatasetItem | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchDataset1();
      setItems(data.items || []);
      if (data.items && data.items.length > 0) {
        setSelectedItem(data.items[0]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.expression.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase()) ||
      item.index.toString().includes(search);

    if (filterMode === 'with_image') return matchesSearch && !!item.imageUrl;
    if (filterMode === 'excel_only') return matchesSearch && !item.imageUrl;
    return matchesSearch;
  });

  const handleEvaluateDatasetItem = async (item: DatasetItem) => {
    setIsEvaluating(true);
    addToast(`Loading Dataset1 Item #${item.index} into AI Evaluation engine...`, 'info');

    try {
      let base64Image = '';
      if (item.imageUrl) {
        try {
          const resp = await fetch(item.imageUrl);
          const blob = await resp.blob();
          base64Image = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.error('Failed to convert image to base64', e);
        }
      }

      const students = dbState?.students || [];
      const defaultStudent = students[0] || { id: 'std_1', name: 'Rahul Kumar' };

      const sub = await analyzeHandwriting({
        image_base64: base64Image || undefined,
        question: `Evaluate expression from Dataset1: ${item.expression}`,
        topic: 'Maths Handwritten Dataset1',
        subject: 'Mathematics',
        max_marks: 10,
        student_id: defaultStudent.id,
        student_name: defaultStudent.name,
        feedback_mode: 'Encouraging',
      });

      setSelectedSubmission(sub);
      setActiveView('analysis');
    } catch (e) {
      console.error(e);
      addToast('Error evaluating dataset item', 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#2D4A3E] text-white p-6 rounded-3xl border border-[#23382F] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-[#3A5A40] text-white rounded-2xl border border-[#4F7357] shadow-sm">
            <Database className="w-7 h-7 text-[#FDFCF8]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#FDFCF8]">Dataset 1 Explorer</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-[#8B9E82] text-[#1E3A2B] rounded-full">
                Connected & Live
              </span>
            </div>
            <p className="text-xs text-[#C2C9BF] mt-1">
              Maths Handwritten Dataset (`Maths_eqations_handwritten.xlsx` + 60 PNG scans). Browse, inspect answers, and trigger GradeMate AI Evaluation on any item.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center space-x-3 text-xs bg-[#23382F] p-3 rounded-2xl border border-[#3A5A40]">
          <div className="text-center px-3 border-r border-[#3A5A40]">
            <div className="text-base font-bold text-[#FDFCF8]">{items.length}</div>
            <div className="text-[10px] text-[#A3B19B]">Excel Rows</div>
          </div>
          <div className="text-center px-3 border-r border-[#3A5A40]">
            <div className="text-base font-bold text-[#A3C9A8]">{items.filter((i) => i.imageUrl).length}</div>
            <div className="text-[10px] text-[#A3B19B]">Handwritten PNGs</div>
          </div>
          <div className="text-center px-3">
            <div className="text-base font-bold text-[#E0C097]">100%</div>
            <div className="text-[10px] text-[#A3B19B]">AI Ready</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#F4F2EC] p-4 rounded-2xl border border-[#E0DED7] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#6E7269] absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search equation or answer (e.g., 3 + 4)..."
            className="w-full bg-[#FDFCF8] border border-[#D5D2C8] rounded-xl pl-9 pr-4 py-2 text-xs text-[#222521] focus:outline-none focus:border-[#2D4A3E]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-[#6E7269]" />
          <span className="text-xs text-[#6E7269] font-medium hidden sm:inline">Filter:</span>
          {(['all', 'with_image', 'excel_only'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterMode === mode
                  ? 'bg-[#2D4A3E] text-white shadow-sm'
                  : 'bg-[#EAE7DF] text-[#545850] hover:bg-[#DEDAD0]'
              }`}
            >
              {mode === 'all' && `All (${items.length})`}
              {mode === 'with_image' && `Has PNG Scans (${items.filter((i) => i.imageUrl).length})`}
              {mode === 'excel_only' && `Excel Only (${items.filter((i) => !i.imageUrl).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content Layout */}
      {loading ? (
        <div className="p-12 text-center bg-[#FDFCF8] rounded-3xl border border-[#E0DED7] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#2D4A3E] animate-spin" />
          <p className="text-xs font-medium text-[#6E7269]">Loading Dataset 1 from Excel and Image Storage...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Table List (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-[#FDFCF8] border border-[#E0DED7] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#222521] flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-[#2D4A3E]" />
                <span>Dataset 1 Records ({filteredItems.length})</span>
              </h2>
              <span className="text-[11px] text-[#6E7269]">Click any row to inspect & evaluate</span>
            </div>

            <div className="overflow-x-auto max-h-[550px] overflow-y-auto border border-[#E0DED7] rounded-2xl">
              <table className="w-full text-left text-xs text-[#222521]">
                <thead className="bg-[#F4F2EC] text-[#545850] uppercase text-[10px] font-bold sticky top-0">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Expression</th>
                    <th className="p-3">Expected Answer</th>
                    <th className="p-3">Scan Image</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0DED7]">
                  {filteredItems.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#EAF0E8] font-semibold' : 'hover:bg-[#F8F7F2]'
                        }`}
                      >
                        <td className="p-3 font-mono text-[#6E7269]">{item.index}</td>
                        <td className="p-3 font-mono font-medium text-[#222521]">{item.expression}</td>
                        <td className="p-3 font-mono text-[#2D4A3E] font-bold">{item.answer}</td>
                        <td className="p-3">
                          {item.imageUrl ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#D2E3D0] text-[#1E3A2B] rounded-full inline-flex items-center space-x-1">
                              <ImageIcon className="w-3 h-3" />
                              <span>PNG Scan</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#9A9E96]">Text only</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEvaluateDatasetItem(item);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-lg transition-colors inline-flex items-center space-x-1 shadow-xs"
                          >
                            <BrainCircuit className="w-3 h-3" />
                            <span>Evaluate</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Item Inspector (Right 5 Cols) */}
          <div className="lg:col-span-5 bg-[#FDFCF8] border border-[#E0DED7] rounded-3xl p-5 shadow-sm space-y-5 flex flex-col justify-between">
            {selectedItem ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E0DED7] pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#6E7269] uppercase tracking-wider">
                      Item #{selectedItem.index} Inspector
                    </span>
                    <h3 className="text-lg font-extrabold text-[#222521] font-mono mt-0.5">
                      {selectedItem.expression}
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-[#2D4A3E] text-white text-xs font-mono font-bold rounded-xl">
                    Ans: {selectedItem.answer}
                  </span>
                </div>

                {/* Scan Image preview */}
                <div>
                  <div className="text-xs font-bold text-[#545850] mb-2 flex items-center justify-between">
                    <span>Handwritten Scan Image</span>
                    {selectedItem.imageFilename && (
                      <span className="text-[10px] font-mono text-[#6E7269]">{selectedItem.imageFilename}</span>
                    )}
                  </div>
                  {selectedItem.imageUrl ? (
                    <div className="p-3 bg-[#F4F2EC] rounded-2xl border border-[#E0DED7] flex items-center justify-center min-h-[200px]">
                      <img
                        src={selectedItem.imageUrl}
                        alt={`Dataset1 Scan ${selectedItem.index}`}
                        className="max-h-56 object-contain rounded-lg border border-[#D5D2C8] bg-white shadow-xs"
                      />
                    </div>
                  ) : (
                    <div className="p-8 bg-[#F4F2EC] rounded-2xl border border-dashed border-[#D5D2C8] text-center text-xs text-[#6E7269]">
                      No image scan available for row #{selectedItem.index}. Formula text can still be evaluated by GradeMate AI.
                    </div>
                  )}
                </div>

                {/* Details list */}
                <div className="bg-[#F8F7F2] p-4 rounded-2xl border border-[#E0DED7] space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#E0DED7]">
                    <span className="text-[#6E7269]">Source File:</span>
                    <span className="font-semibold font-mono text-[#222521]">Maths_eqations_handwritten.xlsx</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E0DED7]">
                    <span className="text-[#6E7269]">Expression:</span>
                    <span className="font-bold font-mono text-[#2D4A3E]">{selectedItem.expression}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#6E7269]">Target Answer:</span>
                    <span className="font-bold font-mono text-[#C88A58]">{selectedItem.answer}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-[#6E7269]">Select a row to view scan image details</div>
            )}

            {selectedItem && (
              <button
                onClick={() => handleEvaluateDatasetItem(selectedItem)}
                disabled={isEvaluating}
                className="w-full py-3.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center space-x-2 transition-all"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating in AI Vision Engine...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#A3C9A8]" />
                    <span>Evaluate Item #{selectedItem.index} in GradeMate AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

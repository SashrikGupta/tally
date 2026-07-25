import { useSettings } from '../../../contexts/SettingsContext';
import { EDITOR_THEMES, FONT_FAMILIES } from '../../../lib/constants';
import { Section } from '../../../components/layout/Section';
import { Select, Slider, Switch } from '../../../components/ui';
import { CodeEditor } from '../../../components/editor/CodeEditor';

const SAMPLE = `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        complement = target - n
        if complement in seen:
            return [seen[complement], i]
        seen[n] = i
    return []
`;

const TOGGLES = [
  { key: 'lineNumbers', label: 'Line numbers' },
  { key: 'lineWrapping', label: 'Line wrapping', description: 'Wrap long lines instead of scrolling sideways.' },
  { key: 'bracketMatching', label: 'Bracket matching' },
  { key: 'autoCloseBrackets', label: 'Auto-close brackets' },
  { key: 'highlightActiveLine', label: 'Highlight active line' },
  { key: 'ligatures', label: 'Font ligatures', description: 'Renders -> and != as single glyphs, if the font has them.' },
];

export function EditorSection() {
  const { settings, setEditor } = useSettings();
  const { editor } = settings;

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <Section
        title="Editor theme"
        description="Independent of the interface theme — mix a light UI with a dark editor if you like."
      >
        <Select value={editor.theme} onChange={(e) => setEditor({ theme: e.target.value })} className="!w-56">
          {EDITOR_THEMES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </Select>
      </Section>

      <Section title="Typography">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Select
            label="Font family"
            value={editor.fontFamily}
            onChange={(e) => setEditor({ fontFamily: e.target.value })}
            wrapperClassName="sm:col-span-3"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </Select>
          <Slider
            label="Font size"
            value={editor.fontSize}
            onChange={(fontSize) => setEditor({ fontSize })}
            min={10}
            max={24}
            unit="px"
          />
          <Slider
            label="Tab size"
            value={editor.tabSize}
            onChange={(tabSize) => setEditor({ tabSize })}
            min={1}
            max={8}
            format={(v) => `${v} spaces`}
          />
        </div>
      </Section>

      <Section title="Behaviour">
        <div className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
          {TOGGLES.map((t) => (
            <Switch
              key={t.key}
              label={t.label}
              description={t.description}
              checked={editor[t.key]}
              onChange={(checked) => setEditor({ [t.key]: checked })}
            />
          ))}
        </div>
      </Section>

      <Section title="Live preview" description="Edit freely — nothing here is saved.">
        <div className="h-56 overflow-hidden rounded-lg border border-border shadow-md">
          <CodeEditor value={SAMPLE} onChange={() => {}} language="python" />
        </div>
      </Section>
    </div>
  );
}

import { useSettings } from '../../../contexts/SettingsContext';
import { LANGUAGES } from '../../../lib/constants';
import { Section } from '../../../components/layout/Section';
import { SegmentedControl, Select, Switch } from '../../../components/ui';

export function PlaygroundSection() {
  const { settings, setPlayground } = useSettings();
  const { playground } = settings;

  return (
    <div className="flex max-w-xl flex-col gap-8">
      <Section title="Default language" description="Preselected in every editor across the app.">
        <Select
          value={playground.defaultLanguage}
          onChange={(e) => setPlayground({ defaultLanguage: e.target.value })}
          className="!w-48"
        >
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </Select>
      </Section>

      <Section title="Output panel position">
        <SegmentedControl
          value={playground.outputPosition}
          onChange={(outputPosition) => setPlayground({ outputPosition })}
          options={[
            { id: 'bottom', label: 'Bottom' },
            { id: 'right', label: 'Right' },
          ]}
        />
      </Section>

      <Section title="Auto-run">
        <Switch
          label="Run after each edit pause"
          description="Executes your code automatically once you stop typing."
          checked={playground.autoRunOnSave}
          onChange={(autoRunOnSave) => setPlayground({ autoRunOnSave })}
        />
      </Section>
    </div>
  );
}

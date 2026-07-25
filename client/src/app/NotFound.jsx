import { Link } from 'react-router-dom';
import { IoCompassOutline } from 'react-icons/io5';
import { EmptyState, Button } from '../components/ui';

export function NotFound() {
  return (
    <div className="flex h-full items-center justify-center">
      <EmptyState
        icon={<IoCompassOutline />}
        title="404 — Page not found"
        description="This route doesn't exist. It may have moved, or the link is wrong."
        action={
          <Link to="/home">
            <Button variant="secondary">Back to home</Button>
          </Link>
        }
      />
    </div>
  );
}

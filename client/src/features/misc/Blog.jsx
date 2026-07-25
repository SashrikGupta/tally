import { Link } from 'react-router-dom';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { Button, EmptyState } from '../../components/ui';

export function Blog() {
  return (
    <div className="flex h-full items-center justify-center">
      <EmptyState
        icon={<IoDocumentTextOutline />}
        title="Blog is coming soon"
        description="Write-ups, contest recaps and editorials will land here."
        action={
          <Link to="/home">
            <Button variant="secondary">Back to home</Button>
          </Link>
        }
      />
    </div>
  );
}

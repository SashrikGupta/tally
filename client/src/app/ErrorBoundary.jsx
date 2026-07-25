import { Component } from 'react';
import { ErrorState } from '../components/ui';

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-base">
          <ErrorState
            title="The app hit an unexpected error"
            error={this.state.error}
            onRetry={() => {
              this.setState({ error: null });
              window.location.assign('/');
            }}
          />
        </div>
      );
    }
    return this.props.children;
  }
}

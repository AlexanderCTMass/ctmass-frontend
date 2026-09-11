import { router } from "expo-router";
import { Component, type ErrorInfo, Fragment, type ReactNode } from "react";
import { Text, View } from "react-native";

import { AppSplash } from "@/components/app-splash";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Spacing, makeStyles } from "@/constants/theme";
import { reportError } from "@/lib/analytics";
import { analyticsEvents, currentScreen } from "@/lib/analytics-events";
import { resolveScheme, useThemeStore } from "@/store/use-theme-store";

const MAX_AUTO_RETRIES = 3;
const RECOVERY_DELAY_MS = 1200;
const STABLE_RESET_MS = 30_000;

type Props = {
  children: ReactNode;
  onReset?: () => void;
};

type State = {
  error: Error | null;
  attempts: number;
  resetKey: number;
  errorAt: number;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null, attempts: 0, resetKey: 0, errorAt: 0 };

  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private stableTimer: ReturnType<typeof setTimeout> | null = null;

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error, errorAt: Date.now() };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const attempt = this.state.attempts + 1;
    const willRetry = attempt <= MAX_AUTO_RETRIES;

    analyticsEvents.errorBoundaryTriggered({
      error_name: error.name,
      error_message: error.message.slice(0, 300),
      component_stack: (info.componentStack ?? "").slice(0, 1000),
      screen: currentScreen(),
      attempt,
      will_retry: willRetry,
    });
    reportError(error, "error_boundary");

    this.clearTimers();
    this.setState({ attempts: attempt });
    if (willRetry) {
      this.retryTimer = setTimeout(this.recover, RECOVERY_DELAY_MS);
    }
  }

  componentWillUnmount(): void {
    this.clearTimers();
  }

  private clearTimers(): void {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    if (this.stableTimer) clearTimeout(this.stableTimer);
    this.retryTimer = null;
    this.stableTimer = null;
  }

  private recover = (): void => {
    analyticsEvents.splashScreenShown({
      trigger: "error_recovery",
      duration_ms: Date.now() - this.state.errorAt,
      theme: resolveScheme(useThemeStore.getState()),
    });
    this.reset();
  };

  private reset = (): void => {
    this.props.onReset?.();
    this.setState((state) => ({ error: null, resetKey: state.resetKey + 1 }));
    setTimeout(() => {
      try {
        router.replace("/");
      } catch {
        // navigator not ready yet; the remounted tree starts from its initial route
      }
    }, 50);
    this.stableTimer = setTimeout(() => {
      this.setState({ attempts: 0 });
    }, STABLE_RESET_MS);
  };

  private handleManualRetry = (): void => {
    analyticsEvents.errorBoundaryRetryTapped({ attempt: this.state.attempts });
    this.clearTimers();
    this.setState({ attempts: 0 });
    this.reset();
  };

  render(): ReactNode {
    if (this.state.error) {
      if (this.state.attempts <= MAX_AUTO_RETRIES) return <AppSplash />;
      return <ErrorFallback onRetry={this.handleManualRetry} />;
    }
    return <Fragment key={this.state.resetKey}>{this.props.children}</Fragment>;
  }
}

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.text}>
        We couldn&apos;t load the app this time. Please try again.
      </Text>
      <View style={styles.action}>
        <PrimaryButton label="Try again" withArrow={false} onPress={onRetry} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    backgroundColor: t.colors.background,
  },
  title: {
    color: t.colors.text,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  text: {
    color: t.colors.textSecondary,
    fontSize: 14.5,
    lineHeight: 21,
    textAlign: "center",
  },
  action: {
    alignSelf: "stretch",
    marginTop: Spacing.lg,
  },
}));

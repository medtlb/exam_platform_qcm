import { createHashRouter } from "react-router-dom";
import { LoginScreen } from "../features/auth/LoginScreen";
import { ExamRunner } from "../features/exam/ExamRunner";
import { HomeScreen } from "../features/exam/HomeScreen";
import { LessonScreen } from "../features/lessons/LessonScreen";
import { LessonsPrintView } from "../features/lessons/LessonsPrintView";
import { LessonsScreen } from "../features/lessons/LessonsScreen";
import { HistoryScreen } from "../features/results/HistoryScreen";
import { PrintView } from "../features/results/PrintView";
import { ResultsScreen } from "../features/results/ResultsScreen";
import { SettingsScreen } from "../features/settings/SettingsScreen";
import { TrackPickerScreen } from "../features/tracks/TrackPickerScreen";
import { Layout } from "./Layout";
import { RedirectIfAuthed, RequireAuth } from "./RequireAuth";
import { TrackRoute } from "./TrackRoute";

export const router = createHashRouter([
  {
    path: "/attempt/:attemptId/print",
    element: <PrintView />,
  },
  {
    // Trailing "print" is a static segment, so this outranks the
    // "/:track/lessons/:lessonId" reader below (which would otherwise treat
    // "print" as a lessonId) regardless of the leading :track being dynamic
    // in both. Kept outside the Layout/TrackRoute tree — it's a bare print
    // page — so it resolves its own TrackConfig from the :track param.
    path: "/:track/lessons/print",
    element: <LessonsPrintView />,
  },
  {
    element: <Layout />,
    children: [
      {
        path: "/login",
        element: (
          <RedirectIfAuthed>
            <LoginScreen />
          </RedirectIfAuthed>
        ),
      },
      {
        path: "/",
        element: (
          <RequireAuth>
            <TrackPickerScreen />
          </RequireAuth>
        ),
      },
      {
        path: "/:track",
        element: (
          <RequireAuth>
            <TrackRoute />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <HomeScreen /> },
          { path: "exam", element: <ExamRunner /> },
          { path: "results/:attemptId", element: <ResultsScreen /> },
          { path: "history", element: <HistoryScreen /> },
          { path: "settings", element: <SettingsScreen /> },
          { path: "lessons", element: <LessonsScreen /> },
          { path: "lessons/:lessonId", element: <LessonScreen /> },
        ],
      },
    ],
  },
]);

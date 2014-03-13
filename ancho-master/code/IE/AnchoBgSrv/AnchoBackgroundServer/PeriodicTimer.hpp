#pragma once

namespace Ancho {
namespace Utils {

/**
 * Executes a callback function in regular intervals
 **/
struct PeriodicTimer: public boost::noncopyable
{
  struct ETimerFailure : EFail { };

  static void CALLBACK callback(void *aParameter, BOOLEAN aTimerOrWaitFired)
  {
    PeriodicTimer *timer = reinterpret_cast<PeriodicTimer*>(aParameter);
    if (timer) {
      ATLASSERT(!timer->mCallback.empty());
      try {
        timer->mCallback();
      }
      #pragma warning(suppress : 4101) //unreferenced variable e
      catch (std::exception &e) {
        ATLTRACE("Timer callback exception : %s\n", e.what());
      }
    }
  }

  PeriodicTimer()
    : mTimerHandle(NULL), mTimerQueue(NULL), mPeriod(0)
  {}

  ~PeriodicTimer()
  {
    stop();
  }

  void initialize(boost::function<void(void)> aCallback, unsigned long aPeriodMS, HANDLE aTimerQueue = NULL)
  {
    stop();

    if (aCallback.empty()) {
      ANCHO_THROW(EInvalidArgument());
    }
    mCallback = aCallback;

    mTimerQueue = aTimerQueue;
    mPeriod = aPeriodMS;
  }

  void start()
  {
    if (!CreateTimerQueueTimer(
      &mTimerHandle,
      mTimerQueue,
      (WAITORTIMERCALLBACK) &PeriodicTimer::callback,
      (void*) this,
      mPeriod,
      mPeriod,
      WT_EXECUTEDEFAULT
      ))
    {
      ANCHO_THROW(ETimerFailure());
    }
  }

  bool isRunning() const
  {
    return mTimerHandle != NULL;
  }

  void stop()
  {
    if (isRunning()) {
      DeleteTimerQueueTimer(mTimerQueue, mTimerHandle, NULL);
      mTimerHandle = NULL;
      mTimerQueue = NULL;
    }
  }

  HANDLE mTimerHandle;
  HANDLE mTimerQueue;
  unsigned long mPeriod;

  boost::function<void(void)> mCallback;
};

} //namespace Utils
} //namespace Ancho


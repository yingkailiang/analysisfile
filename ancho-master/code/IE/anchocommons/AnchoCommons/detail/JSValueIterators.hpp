#pragma once

#include <string>
#include <map>
#include <sstream>
#include <algorithm>
#include <iterator>
#include <Exceptions.h>

namespace Ancho {
namespace Utils {
namespace detail {

//---------------------------------------------------------------------------------------------
class MemberForwardIterator: public std::iterator<std::forward_iterator_tag, const std::wstring>
{
public:
	static const DWORD ALLOWED_PROPERTY_MASK = fdexPropCanGet | fdexPropCannotCall | fdexPropCannotConstruct | fdexPropCannotSourceEvents;
	friend class JSValueWrapper;
  friend class JSValueWrapperConst;
  friend class JSArrayWrapper;
  friend class JSArrayWrapperConst;
  friend class JSObjectWrapper;
  friend class JSObjectWrapperConst;


	MemberForwardIterator():mIsValid(false), mObject(NULL){}

	MemberForwardIterator end()const {	return MemberForwardIterator();	}
	bool operator==(const MemberForwardIterator& aIterator) const
	{
		return ((mIsValid && aIterator.mIsValid) && (mCurrentDispid == aIterator.mCurrentDispid))
			|| (!mIsValid && !aIterator.mIsValid);
	}

	bool operator!=(const MemberForwardIterator& aIterator) const {	return !(*this == aIterator);	}

	MemberForwardIterator& operator++()
	{
    moveToNextMember();
		return *this;
	}

	MemberForwardIterator operator++(int)
	{
		MemberForwardIterator tmp(*this);
		operator++();
		return tmp;
	}

	reference operator*()
  {
    ATLASSERT(mIsValid);
    return mCurrentMember;
  }

  //Iterator doesn't "own" the object -> we use raw pointer
	MemberForwardIterator(IDispatchEx *aObject): mCurrentDispid(DISPID_STARTENUM), mObject(aObject), mIsValid(false)
	{
		if (!mObject) { //This iterator will remain invalid
			return;
		}
		moveToNextMember();
	}

protected:

  void moveToNextMember()
  {
    ATLASSERT(mObject);
    HRESULT hr = S_OK;
    while (S_OK == (hr = mObject->GetNextDispID(fdexEnumAll, mCurrentDispid, &mCurrentDispid))) {
			DWORD properties;
			hr = mObject->GetMemberProperties(mCurrentDispid, grfdexPropAll, &properties);

			//if (S_OK != hr || (ALLOWED_PROPERTY_MASK & properties)) { //properties are always 0 - WHY??
				break;
			//}
		}
		if (hr == S_OK) {
			mIsValid = true;
      CComBSTR name;
      IF_FAILED_THROW(mObject->GetMemberName(mCurrentDispid, &name));
      mCurrentMember = name;
		} else {
      mIsValid = false;
    }
  }

	DISPID				mCurrentDispid;
	std::wstring	mCurrentMember;
	IDispatchEx 	*mObject;
	bool					mIsValid;
};



} //namespace detail
} //namespace Utils
} //namespace Ancho
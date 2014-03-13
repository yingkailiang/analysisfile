#define installRoot "install"
#define installBin "install\bin"

; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
#define AppUUID "BB94A47D-EC8E-4476-A48F-DDE09BEBCE46"

;#define appCompany "Salsita" 
;#define appName "Ancho" 
;#define setupPrefix "ancho-ie" 
;#define appVersion "0.7.0"

; command line has to /D efine:
; appName
; appCompany
; setupPrefix
; appVersion

; appUpdateUrl

; crtPath

; 64bit version of AnchoBgSrv.exe shouldn't be installed - IE can mix 32/64 bit versions
[Setup]
AppId={#AppUUID}
AppName={#appName}
AppVersion={#appVersion}
AppPublisher={#appCompany}
DefaultDirName={pf}\{#appName}
DisableDirPage=no
DefaultGroupName={#appName}
DisableProgramGroupPage=yes
OutputBaseFilename={#setupPrefix}-{#appVersion}
Compression=lzma
SolidCompression=yes

ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "{#installBin}\x86\ancho.dll"; DestDir: "{app}\x86"; Flags: ignoreversion regserver; Check: ShouldInstallAncho
Source: "{#installBin}\x64\ancho.dll"; DestDir: "{app}\x64"; Flags: ignoreversion regserver; Check: ShouldInstallAncho64
Source: "{#installBin}\x86\AnchoBgSrv.exe"; DestDir: "{app}\x86"; Flags: ignoreversion; Check: ShouldInstallAncho
;Source: "{#installBin}\x64\AnchoBgSrv.exe"; DestDir: "{app}\x64";Flags: ignoreversion; Check: ShouldInstallAncho64
Source: "{#installBin}\x86\AnchoShared.dll"; DestDir: "{app}\x86"; Flags: ignoreversion; Check: ShouldInstallAncho
Source: "{#installBin}\x64\AnchoShared.dll"; DestDir: "{app}\x64"; Flags: ignoreversion; Check: ShouldInstallAncho64
Source: "{#installBin}\x86\Magpie.dll"; DestDir: "{app}\x86"; Flags: ignoreversion; Check: ShouldInstallAncho
Source: "{#installBin}\x64\Magpie.dll"; DestDir: "{app}\x64"; Flags: ignoreversion; Check: ShouldInstallAncho64
Source: "{#installBin}\iesetuphelper.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#installBin}\vcredist_x86.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall; Check: ShouldInstallAncho
Source: "{#installBin}\vcredist_x64.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall; Check: ShouldInstallAncho64

[Registry]
Root: HKCU; Subkey: "Software\Salsita\AnchoAddonService";
Root: HKCU; Subkey: "Software\Salsita\AnchoAddonService"; ValueName: "Version"; ValueType: string; ValueData: "{#emit SetupSetting("appVersion")}"; Flags: uninsdeletekey
#IFDEF appUpdateUrl
  Root: HKCU; Subkey: "Software\Salsita\AnchoAddonService"; ValueName: "UpdateUrl"; ValueType: string; ValueData: "{#appUpdateUrl}"; Flags: uninsdeletekey
#ENDIF

[Run]
Filename: "{app}\x86\AnchoBgSrv.exe"; Parameters: "/RegServer /s"; Flags: waituntilterminated
;Filename: "{app}\x64\AnchoBgSrv.exe"; Parameters: "/RegServer /s"; Flags: waituntilterminated; Check: Is64BitInstallMode
;Filename: "regsvr32"; Parameters: "/s ""{app}\x86\ancho.dll"""; Flags: waituntilterminated
;Filename: "regsvr32"; Parameters: "/s ""{app}\x64\ancho.dll"""; Flags: waituntilterminated; Check: Is64BitInstallMode

[UninstallRun]
Filename: "{app}\x86\AnchoBgSrv.exe"; Parameters: "/UnRegServer /s"
Filename: "regsvr32"; Parameters: "/s /u ""{app}\x86\ancho.dll"""
;Filename: "{app}\x64\AnchoBgSrv.exe"; Parameters: "/UnRegServer /s"; Check: Is64BitInstallMode
Filename: "regsvr32"; Parameters: "/s /u ""{app}\x64\ancho.dll"""; Check: Is64BitInstallMode

[Code]
var 
  shouldInstallAnchoFlag : Boolean;
  shouldUninstallAnchoFlag : Boolean;
  uninstallPath : String;
  alreadyInstalledVersion: String;


#include installBin + "\helpercode.isi"

#include "versionComparison.isi"

function ShouldInstallAncho(): Boolean;
begin
  Result := shouldInstallAnchoFlag;
end;   

function ShouldInstallAncho64(): Boolean;
begin
  Result := shouldInstallAnchoFlag and Is64BitInstallMode();
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if (CurUninstallStep = usUninstall) then
  begin
    if Is64BitInstallMode() then
    begin
      UnloadDLL(ExpandConstant('{app}\iesetuphelper_x64.dll'));
    end else 
    begin
      UnloadDLL(ExpandConstant('{app}\iesetuphelper_x86.dll'));
    end;
  end;
end;

function CheckInstalledVersions(): Boolean;
var
  alreadyInstalled : Boolean;
  uninstallKey : String;
  rootKey : Integer;
begin
  Result := True;
  uninstallKey := ExpandConstant('Software\Microsoft\Windows\CurrentVersion\Uninstall\{#emit SetupSetting("AppId")}_is1');
  alreadyInstalled := False;
  if RegKeyExists(HKEY_LOCAL_MACHINE, uninstallKey) then 
  begin 
    rootKey := HKEY_LOCAL_MACHINE;
    alreadyInstalled := True;
  end else begin
    if RegKeyExists(HKEY_CURRENT_USER, uninstallKey) then 
    begin 
      rootKey := HKEY_CURRENT_USER;
      alreadyInstalled := True;
    end;
  end;

  if alreadyInstalled then 
  begin
    if RegQueryStringValue(rootKey, uninstallKey, 'DisplayVersion', alreadyInstalledVersion) then
    begin
      case CompareVersion(alreadyInstalledVersion, '{#emit SetupSetting("AppVersion")}') of
      -1: 
        begin
          if RegQueryStringValue(rootKey, uninstallKey, 'UninstallString', uninstallPath) then
          begin
            StringChangeEx(uninstallPath, '"', '', True);
            shouldUninstallAnchoFlag := True;
          end; 
        end;
      0: 
        begin
          shouldInstallAnchoFlag := False;
        end;
      1: 
        begin
          shouldInstallAnchoFlag := False;
        end;
      end;
    end;
  end;
end;

function UninstallOlderVersion: Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  
  if shouldUninstallAnchoFlag then
  begin
    if MsgBox('Previous version of the application must be uninstalled.', mbConfirmation, MB_OKCANCEL) = IDOK then
    begin
      Exec(uninstallPath, '', GetCurrentDir(), SW_SHOW, ewWaitUntilTerminated, ResultCode);
    end else begin
      Result := False;
    end;
  end;
end;

function PrepareToInstall(var NeedsRestart: Boolean): String;
begin
  Result:= '';  
  if not UninstallOlderVersion() then
  begin
    Result := 'Previous version must be uninstalled.';
  end;
end;

function InitializeSetup: Boolean;
begin
  shouldInstallAnchoFlag := True;
  shouldUninstallAnchoFlag := False;
  Result := EnsureIENotRunning(True, WizardSilent());

  Result := CheckInstalledVersions() and Result;
end;

procedure KillBackgroundServiceUninst;
begin
  KillAllProcessesByAboslutePathUninst(ExpandConstant('{app}\x86\AnchoBgSrv.exe'));
  //KillAllProcessesByAboslutePathUninst(ExpandConstant('{app}\x64\AnchoBgSrv.exe'));
end;

procedure KillBackgroundService;
begin
  KillAllProcessesByAboslutePath(ExpandConstant('{app}\x86\AnchoBgSrv.exe'));
  //KillAllProcessesByAboslutePath(ExpandConstant('{app}\x64\AnchoBgSrv.exe'));
end;

function InitializeUninstall: Boolean;
begin
  Result := EnsureIENotRunningUninst(False, False);
  if (Result) then
  begin
    KillBackgroundServiceUninst();
  end;
end;

// http://stackoverflow.com/questions/11137424/how-to-make-vcredist-x86-reinstall-only-if-not-yet-installed
#IFDEF UNICODE
  #DEFINE AW "W"
#ELSE
  #DEFINE AW "A"
#ENDIF
type
  INSTALLSTATE = Longint;
const
  INSTALLSTATE_INVALIDARG = -2;  // An invalid parameter was passed to the function.
  INSTALLSTATE_UNKNOWN = -1;     // The product is neither advertised or installed.
  INSTALLSTATE_ADVERTISED = 1;   // The product is advertised but not installed.
  INSTALLSTATE_ABSENT = 2;       // The product is installed for a different user.
  INSTALLSTATE_DEFAULT = 5;      // The product is installed for the current user.

  //VC_2005_REDIST_X86 = '{A49F249F-0C91-497F-86DF-B2585E8E76B7}';
  //VC_2005_REDIST_X64 = '{6E8E85E8-CE4B-4FF5-91F7-04999C9FAE6A}';
  //VC_2005_REDIST_IA64 = '{03ED71EA-F531-4927-AABD-1C31BCE8E187}';
  //VC_2005_SP1_REDIST_X86 = '{7299052B-02A4-4627-81F2-1818DA5D550D}';
  //VC_2005_SP1_REDIST_X64 = '{071C9B48-7C32-4621-A0AC-3F809523288F}';
  //VC_2005_SP1_REDIST_IA64 = '{0F8FB34E-675E-42ED-850B-29D98C2ECE08}';
  //VC_2005_SP1_ATL_SEC_UPD_REDIST_X86 = '{837B34E3-7C30-493C-8F6A-2B0F04E2912C}';
  //VC_2005_SP1_ATL_SEC_UPD_REDIST_X64 = '{6CE5BAE9-D3CA-4B99-891A-1DC6C118A5FC}';
  //VC_2005_SP1_ATL_SEC_UPD_REDIST_IA64 = '{85025851-A784-46D8-950D-05CB3CA43A13}';

  VC_2008_REDIST_X86 = '{FF66E9F6-83E7-3A3E-AF14-8DE9A809A6A4}';
  VC_2008_REDIST_X64 = '{350AA351-21FA-3270-8B7A-835434E766AD}';
  VC_2008_REDIST_IA64 = '{2B547B43-DB50-3139-9EBE-37D419E0F5FA}';
  VC_2008_SP1_REDIST_X86 = '{9A25302D-30C0-39D9-BD6F-21E6EC160475}';
  VC_2008_SP1_REDIST_X64 = '{8220EEFE-38CD-377E-8595-13398D740ACE}';
  VC_2008_SP1_REDIST_IA64 = '{5827ECE1-AEB0-328E-B813-6FC68622C1F9}';
  VC_2008_SP1_ATL_SEC_UPD_REDIST_X86 = '{1F1C2DFC-2D24-3E06-BCB8-725134ADF989}';
  VC_2008_SP1_ATL_SEC_UPD_REDIST_X64 = '{4B6C7001-C7D6-3710-913E-5BC23FCE91E6}';
  VC_2008_SP1_ATL_SEC_UPD_REDIST_IA64 = '{977AD349-C2A8-39DD-9273-285C08987C7B}';
  VC_2008_SP1_MFC_SEC_UPD_REDIST_X86 = '{9BE518E6-ECC6-35A9-88E4-87755C07200F}';
  VC_2008_SP1_MFC_SEC_UPD_REDIST_X64 = '{5FCE6D76-F5DC-37AB-B2B8-22AB8CEDB1D4}';
  VC_2008_SP1_MFC_SEC_UPD_REDIST_IA64 = '{515643D1-4E9E-342F-A75A-D1F16448DC04}';

  VC_2010_REDIST_X86 = '{196BB40D-1578-3D01-B289-BEFC77A11A1E}';
  VC_2010_REDIST_X64 = '{DA5E371C-6333-3D8A-93A4-6FD5B20BCC6E}';
  VC_2010_REDIST_IA64 = '{C1A35166-4301-38E9-BA67-02823AD72A1B}';
  VC_2010_SP1_REDIST_X86 = '{F0C3E5D1-1ADE-321E-8167-68EF0DE699A5}';
  VC_2010_SP1_REDIST_X64 = '{1D8E6291-B0D5-35EC-8441-6616F567A0F7}';
  VC_2010_SP1_REDIST_IA64 = '{88C73C1C-2DE5-3B01-AFB8-B46EF4AB41CD}';

function MsiQueryProductState(szProduct: string): INSTALLSTATE;
  external 'MsiQueryProductState{#AW}@msi.dll stdcall';

function VCVersionInstalled(const ProductID: string): Boolean;
begin
  Result := MsiQueryProductState(ProductID) = INSTALLSTATE_DEFAULT;
end;

function VCRedistX86NeedsInstall: Boolean;
begin
  // here the Result must be True when you need to install your VCRedist
  // or False when you don't need to, so now it's upon you how you build
  Result := not (VCVersionInstalled(VC_2010_SP1_REDIST_X86)) and ShouldInstallAncho();
end;

function VCRedistX64NeedsInstall: Boolean;
begin
  // here the Result must be True when you need to install your VCRedist
  // or False when you don't need to, so now it's upon you how you build
  Result := not (VCVersionInstalled(VC_2010_SP1_REDIST_X64)) and ShouldInstallAncho();
end;

procedure SimulateProgress(const From, UpTo: Integer);
var
  I: Integer;
begin
  for I := From to UpTo do
  begin
    WizardForm.ProgressGauge.Position := I;
    Sleep(20);
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ReturnCode: Integer;
  ProgressMin: Longint;
  ProgressMax: Longint;
  ProgressPos: Longint;
begin
  if (CurStep = ssInstall) then
  begin
    KillBackgroundService();

    if VCRedistX86NeedsInstall() then
    begin

      // save the original "configuration" of the progress bar
      ProgressMin := WizardForm.ProgressGauge.Min;
      ProgressMax := WizardForm.ProgressGauge.Max;
      ProgressPos := WizardForm.ProgressGauge.Position;

      WizardForm.StatusLabel.Caption := 'Extracting Microsoft VC++ 2010 x86 Runtime...';
      WizardForm.ProgressGauge.Min := 0;
      WizardForm.ProgressGauge.Max := 100;

      SimulateProgress(0, 10);

      ExtractTemporaryFile('vcredist_x86.exe');

      SimulateProgress(10, 40);

      WizardForm.StatusLabel.Caption := 'Installing Microsoft VC++ 2010 x86 Runtime...';

      if Exec (ExpandConstant('{tmp}\vcredist_x86.exe'), '/q', '', SW_SHOW, ewWaitUntilTerminated, ReturnCode) then
      begin
        // Process success if required
      end
      else begin
        // Process failure if required
      end;

      SimulateProgress(40, 100);

      // restore the original "configuration" of the progress bar
      WizardForm.ProgressGauge.Min := ProgressMin;
      WizardForm.ProgressGauge.Max := ProgressMax;
      WizardForm.ProgressGauge.Position := ProgressPos;
    end;

    if VCRedistX64NeedsInstall() and Is64BitInstallMode() then
    begin

      // save the original "configuration" of the progress bar
      ProgressMin := WizardForm.ProgressGauge.Min;
      ProgressMax := WizardForm.ProgressGauge.Max;
      ProgressPos := WizardForm.ProgressGauge.Position;

      WizardForm.StatusLabel.Caption := 'Extracting Microsoft VC++ 2010 x64 Runtime...';
      WizardForm.ProgressGauge.Min := 0;
      WizardForm.ProgressGauge.Max := 100;

      SimulateProgress(0, 10);

      ExtractTemporaryFile('vcredist_x64.exe');

      SimulateProgress(10, 40);

      WizardForm.StatusLabel.Caption := 'Installing Microsoft VC++ 2010 x64 Runtime...';

      if Exec (ExpandConstant('{tmp}\vcredist_x64.exe'), '/q', '', SW_SHOW, ewWaitUntilTerminated, ReturnCode) then
      begin
        // Process success if required
      end
      else begin
        // Process failure if required
      end;

      SimulateProgress(40, 100);

      // restore the original "configuration" of the progress bar
      WizardForm.ProgressGauge.Min := ProgressMin;
      WizardForm.ProgressGauge.Max := ProgressMax;
      WizardForm.ProgressGauge.Position := ProgressPos;
    end;
  end;
end;

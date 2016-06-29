package main

import (
	"encoding/json"
	"net"
	"runtime"
	"testing"
)

func TestMissingIPConfig(t *testing.T) {
	const file = "test/config/noip.json"
	const setting = "publicIP"
	_, err := loadConfig(file, false)
	if err == nil {
		t.Fatal("Was expecting to get an error back, but didn't get one!")
	}
	switch typ := err.(type) {
	case MissingConfigError:
		if typ.File != file {
			t.Errorf("Error message references the wrong config file:\n%s\n\nExpected config file %q not %q", typ, file, typ.File)
		}
		if typ.Setting != setting {
			t.Errorf("Error message references the wrong missing setting:\n%s\n\nExpected missing setting %q not %q", typ, setting, typ.Setting)
		}
	default:
		t.Fatalf("Was expecting an error of type MissingConfigError but received error of type %T", err)
	}
}

func TestValidConfig(t *testing.T) {
	const file = "test/config/valid.json"
	const ipaddr = "2.1.2.1"
	const workerType = "some-worker-type"
	config, err := loadConfig(file, false)
	if err != nil {
		t.Fatalf("Config should pass validation, but get:\n%s", err)
	}
	if actualIP := config.PublicIP.String(); actualIP != ipaddr {
		t.Fatalf("Was expecting IP address %s but received IP address %s", ipaddr, actualIP)
	}
	if actualWorkerType := config.WorkerType; actualWorkerType != workerType {
		t.Fatalf("Was expecting worker type %s but received worker type %s", workerType, actualWorkerType)
	}
}

func TestInvalidIPConfig(t *testing.T) {
	const file = "test/config/invalid-ip.json"
	_, err := loadConfig(file, false)
	if err == nil {
		t.Fatal("Was expecting to get an error back due to an invalid IP address, but didn't get one!")
	}
	switch err.(type) {
	case *net.ParseError:
		// all ok
	default:
		t.Fatalf("Was expecting an error of type *net.ParseError but received error of type %T", err)
	}
}

func TestInvalidJsonConfig(t *testing.T) {
	const file = "test/config/invalid-json.json"
	_, err := loadConfig(file, false)
	if err == nil {
		t.Fatal("Was expecting to get an error back due to an invalid IP address, but didn't get one!")
	}
	switch err.(type) {
	case *json.SyntaxError:
		// all ok
	default:
		t.Fatalf("Was expecting an error of type *json.SyntaxError but received error of type %T", err)
	}
}

func TestMissingConfigFile(t *testing.T) {
	const file = "test/config/non-existent-json.json"
	_, err := loadConfig(file, false)
	if err == nil {
		t.Fatal("Was expecting to get an error back due to an invalid IP address, but didn't get one!")
	}
	switch err.(type) {
	case MissingConfigError:
		// all ok
	default:
		t.Fatalf("Was expecting an error of type MissingConfigError but received error of type %T", err)
	}
}

func TestWorkerTypeMetadata(t *testing.T) {
	const file = "test/config/worker-type-metadata.json"
	config, err := loadConfig(file, false)
	if err != nil {
		t.Fatalf("Config should pass validation, but get:\n%s", err)
	}
	// loadConfig function specifies a value, let's check we can override it in the config file
	if config.WorkerTypeMetaData["go-os"] != "fakeos" {
		t.Fatal("Was expecting key 'go-os' from file worker-type-metadata.json to override default value")
	}
	// go-version not specified in config file, but should be set in loadConfig, let's check it is
	if config.WorkerTypeMetaData["go-version"] != runtime.Version() {
		t.Fatal("Was expecting key 'go-version' to be set to go version in worker type metadata")
	}
	// machine-setup is not set in loadConfig, but is set in config file, let's check we have it
	if config.WorkerTypeMetaData["machine-setup"] != "https://raw.githubusercontent.com/taskcluster/generic-worker/2d2ad3000787f2c893299e693ea3f59287127f5c/worker_types/win2012r2/userdata" {
		t.Fatal("Was expecting machine-setup to be set properly")
	}
}
